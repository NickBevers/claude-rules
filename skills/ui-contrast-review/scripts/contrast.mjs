import { pathToFileURL } from 'node:url';

export function parseColor(input) {
  let channels = input;
  if (typeof input === 'string') {
    if (/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(input)) {
      let hex = input.slice(1);
      if (hex.length <= 4) hex = [...hex].map(c => c + c).join('');
      channels = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
      if (hex.length === 8) channels.push(parseInt(hex.slice(6), 16) / 255);
    } else {
      try { channels = JSON.parse(input); }
      catch { throw new Error('Use a hex color or an sRGB JSON array; resolve CSS functions externally.'); }
    }
  }
  if (!Array.isArray(channels) || ![3, 4].includes(channels.length) ||
      channels.some((n, i) => typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > (i === 3 ? 1 : 255))) {
    throw new Error('Expected [r,g,b] or [r,g,b,a], RGB 0–255, alpha 0–1.');
  }
  return [...channels.slice(0, 3), channels[3] ?? 1];
}

function overOpaque(foreground, background) {
  if (background[3] !== 1) throw new Error('Compositing requires an opaque backing surface.');
  return [...foreground.slice(0, 3).map((n, i) => n * foreground[3] + background[i] * (1 - foreground[3])), 1];
}

export function luminance(rgb) {
  const linear = rgb.slice(0, 3).map(n => {
    const c = n / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

export function measureContrast(foreground, background, required = 4.5, backdrop) {
  if (typeof required !== 'number' || !Number.isFinite(required) || required < 1 || required > 21) {
    throw new Error('Required ratio must be a number between 1 and 21.');
  }
  const fg = parseColor(foreground);
  let bg = parseColor(background);
  if (backdrop !== undefined) {
    const backing = parseColor(backdrop);
    if (backing[3] !== 1) throw new Error('Backdrop must be opaque.');
    bg = overOpaque(bg, backing);
  } else if (bg[3] !== 1) {
    throw new Error('Translucent background: supply its actual opaque backdrop.');
  }
  const renderedFg = overOpaque(fg, bg);
  const a = luminance(renderedFg), b = luminance(bg);
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  return {
    ratio,
    displayRatio: `${(Math.floor(ratio * 100) / 100).toFixed(2)}:1`,
    required,
    pass: ratio >= required,
    renderedForeground: renderedFg.slice(0, 3),
    renderedBackground: bg.slice(0, 3),
    method: 'WCAG 2.x sRGB relative luminance; flat alpha compositing',
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = process.argv.slice(2);
    if (args.length < 2 || args.length > 4) throw new Error('Usage: node contrast.mjs foreground background [required=4.5] [opaque-backdrop]');
    const result = measureContrast(args[0], args[1], args[2] === undefined ? 4.5 : Number(args[2]), args[3]);
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.pass ? 0 : 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
