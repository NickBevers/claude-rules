import { createRequire } from 'node:module';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

function loadPackage(id, roots) {
  for (const root of roots.filter(Boolean)) {
    const require = createRequire(join(resolve(root), 'package.json'));
    let entry;
    try { entry = require.resolve(id); }
    catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') continue;
      throw error;
    }
    return require(entry);
  }
  throw new Error(`Missing ${id}. Reuse project dependencies or supply --deps with a temporary installation (see references/runner.md).`);
}

async function writeJSON(path, data) {
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`);
}

function validate(config) {
  if (!config || !['http:', 'https:'].includes(new URL(config.baseURL).protocol)) throw new Error('baseURL must be HTTP(S).');
  for (const field of ['browsers', 'themes', 'viewports', 'scenarios']) {
    if (!Array.isArray(config[field]) || !config[field].length) throw new Error(`${field} must be a nonempty array.`);
  }
  if (config.browsers.some(b => !['chromium', 'firefox', 'webkit'].includes(b))) throw new Error('Unsupported browser engine.');
  for (const field of ['themes', 'viewports', 'scenarios']) {
    const names = config[field].map(item => item?.name);
    if (names.some(n => typeof n !== 'string' || !n.trim()) || new Set(names).size !== names.length) throw new Error(`${field} needs unique, nonempty names.`);
  }
  for (const viewport of config.viewports) {
    if (![viewport.width, viewport.height].every(n => Number.isInteger(n) && n > 0)) throw new Error('Viewport dimensions must be positive integers.');
  }
  if (typeof config.ready !== 'function') throw new Error('Provide ready() to assert the actual app and theme rendered.');
  for (const scenario of config.scenarios) {
    if (typeof scenario.run !== 'function' || typeof scenario.path !== 'string') throw new Error('Each scenario needs path and run().');
    const url = new URL(scenario.path, config.baseURL);
    if (url.origin !== new URL(config.baseURL).origin) throw new Error('Scenario paths must remain on the configured app origin.');
  }
  for (const key of ['timeoutMs', 'scenarioTimeoutMs']) {
    if (config[key] !== undefined && (!Number.isFinite(config[key]) || config[key] <= 0)) throw new Error(`${key} must be positive.`);
  }
}

// Runs inside each accessible browser frame. These are layer-level styles,
// not computed contrast verdicts. Open shadow trees are inventoried separately.
function collectStyles() {
  const properties = ['color', 'background-color', 'background-image', 'opacity',
    'font-size', 'font-weight', 'font-family', 'fill', 'fill-opacity', 'stroke',
    'stroke-opacity', 'stroke-width', 'outline-color', 'outline-width',
    'outline-style', 'outline-offset', 'border-top-color', 'border-top-width',
    'border-right-color', 'border-bottom-color', 'border-left-color',
    'box-shadow', 'text-shadow', 'filter', 'backdrop-filter', 'mix-blend-mode',
    '-webkit-text-fill-color', '-webkit-text-stroke-color'];
  const styles = (element, pseudo) => {
    const computed = getComputedStyle(element, pseudo);
    return Object.fromEntries(properties.map(key => [key, computed.getPropertyValue(key)]));
  };
  const selector = element => {
    const parts = [];
    for (let current = element; current; current = current.parentElement) {
      if (current.id) { parts.unshift(`#${CSS.escape(current.id)}`); break; }
      const tag = current.localName;
      const siblings = current.parentElement ? [...current.parentElement.children].filter(el => el.localName === tag) : [];
      parts.unshift(`${tag}${siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(current) + 1})` : ''}`);
    }
    return parts.join(' > ');
  };
  const elements = [];
  function walk(root, prefix = '') {
    for (const element of root.querySelectorAll('*')) {
      const target = `${prefix}${selector(element)}`;
      if (element.shadowRoot) walk(element.shadowRoot, `${target} >>> `);
      if (['script', 'style', 'template', 'noscript'].includes(element.localName)) continue;
      const rect = element.getBoundingClientRect();
      const computed = getComputedStyle(element);
      if (!rect.width || !rect.height || computed.visibility !== 'visible' ||
          !element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
      const text = [...element.childNodes].filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join(' ').trim();
      const before = getComputedStyle(element, '::before').content;
      const after = getComputedStyle(element, '::after').content;
      const generated = [before, after].some(content => !['none', 'normal', '""', "''"].includes(content));
      if (!text && !generated && !element.matches('a,button,input,textarea,select,[role],[tabindex],svg,svg *,canvas,img,video,progress,meter')) continue;
      const backgrounds = [];
      for (let ancestor = element; ancestor; ancestor = ancestor.parentElement || ancestor.getRootNode().host) {
        const cs = getComputedStyle(ancestor);
        backgrounds.push({ element: selector(ancestor), color: cs.backgroundColor, image: cs.backgroundImage, opacity: cs.opacity, filter: cs.filter, blend: cs.mixBlendMode });
      }
      elements.push({ target, text: text.slice(0, 300), tag: element.localName,
        role: element.getAttribute('role'), name: element.getAttribute('aria-label'),
        placeholder: element.getAttribute('placeholder'), disabled: element.matches(':disabled') || element.getAttribute('aria-disabled') === 'true',
        focused: element.matches(':focus'), focusVisible: element.matches(':focus-visible'),
        rect: rect.toJSON(), inViewport: rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth,
        styles: styles(element), backgrounds,
        pseudo: { before: { content: before, styles: styles(element, '::before') }, after: { content: after, styles: styles(element, '::after') },
          ...(element.matches('input,textarea') ? { placeholder: styles(element, '::placeholder') } : {}) },
      });
    }
  }
  walk(document);
  return { url: location.href, viewport: { width: innerWidth, height: innerHeight },
    devicePixelRatio, scroll: { x: scrollX, y: scrollY }, elements,
    limitations: ['Layer colors are not resolved composites.', 'Closed shadow roots and unmounted content are not inventoried.', 'Occlusion is not fully determined.'] };
}

async function withTimeout(task, milliseconds) {
  let timer;
  try {
    return await Promise.race([task(), new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Scenario exceeded ${milliseconds} ms.`)), milliseconds);
    })]);
  } finally { clearTimeout(timer); }
}

export async function audit(config, { projectDir = process.cwd(), depsDir, outputParent = tmpdir() } = {}) {
  validate(config);
  const roots = [projectDir, depsDir];
  let playwright;
  try { playwright = loadPackage('playwright', roots); }
  catch (error) {
    if (!error.message.startsWith('Missing playwright.')) throw error;
    playwright = loadPackage('@playwright/test', roots);
  }
  const axePackage = loadPackage('@axe-core/playwright', roots);
  const AxeBuilder = axePackage.default || axePackage.AxeBuilder;
  await mkdir(outputParent, { recursive: true });
  const outputDir = await mkdtemp(join(resolve(outputParent), 'contrast-run-'));
  const summary = { createdAt: new Date().toISOString(), baseURL: config.baseURL,
    target: 'WCAG 2.2 AA contrast', manualReviewRequired: true,
    plannedCases: config.browsers.length * config.themes.length * config.viewports.length * config.scenarios.length,
    cases: [], captures: [], errors: [], outputDir };
  let browser;
  try {
    for (const browserName of config.browsers) {
      try { browser = await playwright[browserName].launch(); }
      catch (error) { summary.errors.push({ browserName, message: error.message }); continue; }
      try {
        for (const theme of config.themes) for (const viewport of config.viewports) for (const scenario of config.scenarios) {
          const caseInfo = { scenario: scenario.name, path: scenario.path, browserName, browserVersion: browser.version(), theme: theme.name, viewport };
          const caseResult = { ...caseInfo, status: 'running', captures: [] };
          summary.cases.push(caseResult);
          let context;
          try {
            await withTimeout(async () => {
              context = await browser.newContext({ ...config.contextOptions,
                viewport: { width: viewport.width, height: viewport.height },
                ...(theme.colorScheme ? { colorScheme: theme.colorScheme } : {}) });
              const params = { context, theme, viewport, browserName, scenario };
              context.setDefaultTimeout(config.timeoutMs ?? 15000);
              context.setDefaultNavigationTimeout(config.timeoutMs ?? 15000);
              if (config.prepare) await config.prepare(params);
              const page = await context.newPage();
              const response = await page.goto(new URL(scenario.path, config.baseURL).href, { waitUntil: 'domcontentloaded' });
              if (response && response.status() >= 400) throw new Error(`Page returned HTTP ${response.status()}.`);
              await config.ready({ ...params, page });
              const names = new Set();
              const capture = async name => {
                if (typeof name !== 'string' || !name.trim() || names.has(name)) throw new Error('Capture names must be nonempty and unique within a case.');
                names.add(name);
                const id = String(summary.captures.length + 1).padStart(4, '0');
                const row = { id, ...caseInfo, state: name, status: 'running', files: {}, inventoryErrors: [] };
                summary.captures.push(row);
                caseResult.captures.push(id);
                const captureDir = join(outputDir, id);
                try {
                  await mkdir(captureDir);
                  await page.evaluate(() => document.fonts.ready.then(() => undefined));
                  row.url = page.url();
                  row.capturedAt = new Date().toISOString();
                  for (const [filename, fullPage] of [['viewport.png', false], ['full-page.png', true]]) {
                    await page.screenshot({ path: join(captureDir, filename), fullPage });
                    row.files[filename] = `${id}/${filename}`;
                  }
                  const inventory = [];
                  for (const frame of page.frames()) {
                    try { inventory.push(await frame.evaluate(collectStyles)); }
                    catch (error) { row.inventoryErrors.push({ frame: frame.url(), message: error.message }); }
                  }
                  await writeJSON(join(captureDir, 'styles.json'), inventory);
                  row.files.styles = `${id}/styles.json`;
                  const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
                  await writeJSON(join(captureDir, 'axe.json'), results);
                  row.files.axe = `${id}/axe.json`;
                  const count = category => results[category].reduce((sum, rule) => sum + rule.nodes.length, 0);
                  row.counts = Object.fromEntries(['violations', 'incomplete', 'passes', 'inapplicable'].map(key => [key, count(key)]));
                  row.axeVersion = results.testEngine.version;
                  row.status = row.counts.violations ? 'violations-found' :
                    row.counts.incomplete || !row.counts.passes || row.inventoryErrors.length ? 'needs-review' : 'automated-text-checks-clear';
                } catch (error) { row.status = 'error'; row.error = error.message; throw error; }
                finally { await writeJSON(join(captureDir, 'capture.json'), row); }
                console.log(`${id} ${browserName}/${theme.name}/${viewport.name}/${scenario.name}/${name}: ${row.status}`);
              };
              await scenario.run({ ...params, page, capture });
              if (!caseResult.captures.length) throw new Error('Scenario recorded no captures.');
              caseResult.status = 'completed';
            }, config.scenarioTimeoutMs ?? 60000);
          } catch (error) { caseResult.status = 'error'; caseResult.error = error.message; }
          finally {
            if (context) await context.close().catch(error => { caseResult.status = 'error'; caseResult.error = error.message; });
            await writeJSON(join(outputDir, 'summary.json'), summary);
          }
        }
      } finally { await browser.close(); browser = undefined; }
    }
  } finally {
    if (browser) await browser.close().catch(() => {});
    const failed = summary.errors.length || summary.cases.length !== summary.plannedCases || summary.cases.some(c => c.status !== 'completed') || summary.captures.some(c => c.status === 'error' || c.status === 'running');
    summary.exitCode = failed ? 2 : summary.captures.some(c => c.status !== 'automated-text-checks-clear') ? 1 : 0;
    summary.automatedStatus = failed ? 'incomplete-execution' : summary.exitCode ? 'findings-or-manual-items' : 'automated-text-checks-clear';
    await writeJSON(join(outputDir, 'summary.json'), summary);
    const escape = value => String(value).replace(/[\r\n|`\[\]<>]/g, ' ');
    await writeFile(join(outputDir, 'index.md'), [
      '# Automated contrast evidence', '',
      `Status: ${summary.automatedStatus}. Manual review is required before an AA contrast verdict.`, '',
      `Cases attempted: ${summary.cases.length}/${summary.plannedCases}. Captures: ${summary.captures.length}.`, '',
      '[Raw summary](summary.json)', '',
      '| ID | Scenario / state | Browser / theme / viewport | Automated result | Evidence |',
      '| --- | --- | --- | --- | --- |',
      ...summary.captures.map(c => `| ${c.id} | ${escape(c.scenario)} / ${escape(c.state)} | ${c.browserName} / ${escape(c.theme)} / ${escape(c.viewport.name)} | ${c.status} | [capture](${c.id}/capture.json) |`), '',
      ...summary.errors.map(e => `- Browser error: ${escape(e.browserName)}: ${escape(e.message)}`),
      ...summary.cases.filter(c => c.status !== 'completed').map(c => `- Scenario error: ${escape(c.scenario)} (${escape(c.theme)}, ${escape(c.viewport.name)}): ${escape(c.error)}`), '',
      'Complete the coverage ledger, non-text/focus measurements, complex-background review, exemptions, and incomplete-item resolutions in contrast-review.md.', '',
    ].join('\n'));
  }
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const flags = {};
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i += 2) {
      if (!['--config', '--project', '--deps', '--out'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Usage: node browser-audit.mjs --config file.mjs [--project dir] [--deps dir] [--out dir]');
      flags[args[i].slice(2)] = args[i + 1];
    }
    if (!flags.config) throw new Error('--config is required. See references/runner.md.');
    const config = (await import(pathToFileURL(resolve(flags.config)).href)).default;
    const summary = await audit(config, { projectDir: flags.project, depsDir: flags.deps, outputParent: flags.out });
    console.log(`Evidence: ${summary.outputDir}\nManual review required. Exit code: ${summary.exitCode}`);
    process.exitCode = summary.exitCode;
  } catch (error) { console.error(error.stack || error.message); process.exitCode = 2; }
}
