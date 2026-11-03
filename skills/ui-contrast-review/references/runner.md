# Bundled Playwright runner

Use `scripts/browser-audit.mjs` when there is no suitable existing browser harness. It captures axe text-contrast results, viewport/full-page screenshots, and a computed-style inventory at explicit checkpoints. It does not crawl routes, start the app, log in automatically, or decide full AA conformance. The agent must discover scope, write scenarios, and complete the manual review.

## Dependencies and invocation

Run from the project root with Node.js 20 or newer. Reuse installed `playwright` (or `@playwright/test`) and `@axe-core/playwright`. Packages are resolved from `--project` first and optionally `--deps` second; they need not be installed in the skill folder.

If packages are absent, install them in a temporary tool directory using the environment's normal permission mechanism; do not change the application's dependency files for a one-off review:

```sh
audit_tools_dir=$(mktemp -d)
npm install --prefix "$audit_tools_dir" --no-save --package-lock=false playwright @axe-core/playwright
```

Install the matching browser if needed with that directory's Playwright CLI. Prefer the existing project Playwright/browser pair when available. Choose one installation consistently; browser versions follow the resolved Playwright package. Do not disable browser sandboxing to work around environment restrictions.

Create a project-specific `.mjs` configuration using [assets/audit.config.mjs](../assets/audit.config.mjs) as a starting point. Put the adapted file in the project's review artifact area or a temporary directory. Use actual URLs, theme controls, data, and locators from exploration. The sample's homepage is illustrative and is not full-project coverage.

```sh
node /absolute/path/to/ui-contrast-review/scripts/browser-audit.mjs \
  --config /absolute/path/to/audit.config.mjs \
  --project /absolute/path/to/project \
  --deps "$audit_tools_dir" \
  --out /absolute/path/to/review-artifacts
```

Omit `--deps` when the project supplies the packages. Each invocation creates a fresh `contrast-run-*` directory beneath `--out` (default: the system temporary directory), so earlier evidence is preserved. `summary.json` and `index.md` identify all captures and scenario errors. Output includes `manualReviewRequired: true` even when no automated issue is found.

Exit codes: `0` means automated text checks found passing nodes with no violations or incomplete results; `1` means violations, incomplete items, or no passing text nodes; `2` means a scenario, capture, or setup error. None of these replaces the final manual verdict. Errors remain in the summary and do not prevent unrelated scenarios from running.

## Configuration contract

- `baseURL`: running app URL, HTTP(S).
- `browsers`: installed engine names, e.g. `['chromium']`; expand when supported-browser differences matter.
- `viewports`: nonempty list of `{name, width, height}`; use actual responsive layouts.
- `themes`: nonempty list of `{name, colorScheme?}`; name custom themes explicitly. `colorScheme` only emulates the media preference.
- `contextOptions`: optional Playwright context options, such as a private, existing `storageState` file, locale, or device settings. Do not inline secrets. Explicit viewport/theme fields take precedence.
- `prepare({context, theme, viewport, browserName})`: optional setup before navigation, e.g. an init script for the app's actual persisted theme. The hook is executable project code; inspect the config before running it.
- `ready({page, theme, viewport, scenario, browserName})`: required readiness/theme assertion after navigation. Wait for the real app, avoiding arbitrary sleeps and `networkidle` on apps with long-lived connections.
- `scenarios`: nonempty list of `{name, path, run}`. Each `run({page, capture, theme, viewport, browserName})` must call `await capture('unique-state-name')` at least once. Perform and assert each real interaction before capture; state names are assertions by the author, not independently inferred by the runner. Use separate scenarios for independent flows so failures do not hide other coverage.
- `timeoutMs`: optional per-navigation/action timeout (default 15000); `scenarioTimeoutMs`: whole scenario timeout (default 60000). Increase for a measured need. Each scenario gets a fresh browser context.

The runner waits for document fonts before capture and saves screenshots before scanning to preserve transient states. Wait for relevant images and application transitions in the scenario. Stable-state text scans run only the `color-contrast` rule. Supplement manual focus/color checks from `browser-review.md`; this runner does not test 1.4.11 by itself.

The style inventory covers rendered text/controls/graphics in accessible DOM and open shadow roots, including same-origin and accessible cross-origin frames. It includes local background layers and geometry, not resolved contrast ratios. Closed shadow roots, unmounted/virtualized content, inaccessible frames, and state changes during capture remain coverage gaps. Errors are recorded. Capture additional screenshots/crops and measurement records for individual findings using the browser harness.

## Solid-color calculator

```sh
node /absolute/path/to/ui-contrast-review/scripts/contrast.mjs '#767676' '#ffffff' 4.5
node /absolute/path/to/ui-contrast-review/scripts/contrast.mjs '[0,0,0,0.6]' '#ffffff' 4.5
node /absolute/path/to/ui-contrast-review/scripts/contrast.mjs '#000' '#ffffff80' 4.5 '#222'
```

Arguments are foreground, background, optional required ratio (default 4.5), and optional opaque backdrop. Colors are `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`, or JSON `[r,g,b]` / `[r,g,b,a]` arrays with sRGB channels 0–255 and alpha 0–1. Translucent backgrounds require a known opaque backdrop. Returns JSON and exit `0` for pass, `1` for fail, `2` for invalid/unsupported input. It supports a single flat alpha-compositing stack; resolve group opacity, filters, images, gradients, and modern CSS spaces externally.
