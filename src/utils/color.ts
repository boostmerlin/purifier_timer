// Simple color utilities for hex colors (#RRGGBB or #RGB)
export type HexColor = `#${string}`;

function expandShortHex(hex: string): string {
  if (/^#?[0-9a-fA-F]{3}$/.test(hex)) {
    const h = hex.replace('#', '');
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  }
  return hex.startsWith('#') ? hex : `#${hex}`;
}

export function hexToRgb(hex: HexColor): { r: number; g: number; b: number } {
  const full = expandShortHex(hex);
  const m = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})$/.exec(full);
  if (!m) throw new Error(`Invalid hex color: ${hex}`);
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): HexColor {
  const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return (`#${toHex(r)}${toHex(g)}${toHex(b)}`) as HexColor;
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Interpolate two hex colors by t in [0,1]
export function interpolateHex(start: HexColor, end: HexColor, t: number): HexColor {
  const s = hexToRgb(start);
  const e = hexToRgb(end);
  return rgbToHex(lerp(s.r, e.r, t), lerp(s.g, e.g, t), lerp(s.b, e.b, t));
}
