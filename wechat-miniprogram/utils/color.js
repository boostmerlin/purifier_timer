function expandShortHex(hex) {
  const normalized = hex.charAt(0) === '#' ? hex : `#${hex}`;
  if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
    return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }
  return normalized;
}

function hexToRgb(hex) {
  const full = expandShortHex(hex);
  const match = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})$/.exec(full);
  if (!match) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

function rgbToHex(r, g, b) {
  const toHex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function interpolateHex(start, end, t) {
  const s = hexToRgb(start);
  const e = hexToRgb(end);
  return rgbToHex(lerp(s.r, e.r, t), lerp(s.g, e.g, t), lerp(s.b, e.b, t));
}

function getColorByProgress(progress) {
  const ratio = Math.max(0, Math.min(1, progress));
  return interpolateHex('#2ecc71', '#e74c3c', 1 - ratio);
}

module.exports = {
  expandShortHex,
  hexToRgb,
  rgbToHex,
  lerp,
  interpolateHex,
  getColorByProgress,
};
