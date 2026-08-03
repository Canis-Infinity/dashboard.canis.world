// @ts-nocheck
export function hexToRgb(hex) {
  // 移除#並處理短格式
  hex = hex.replace(/^#/, '');
  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .split('')
      .map(function (hex) {
        return hex + hex;
      })
      .join('');
  }

  let r = parseInt(hex.substr(0, 2), 16),
    g = parseInt(hex.substr(2, 2), 16),
    b = parseInt(hex.substr(4, 2), 16),
    a = hex.length === 8 ? parseInt(hex.substr(6, 2), 16) / 255 : 1;

  return { r: r, g: g, b: b, a: a };
}

export function rgbToHsv(r, g, b, a) {
  (r /= 255), (g /= 255), (b /= 255);

  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    v = max;

  let d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, v: v * 100, a: a };
}

export function hexToRgbHsv(hex) {
  let rgb = hexToRgb(hex);
  let hsv = rgbToHsv(rgb.r, rgb.g, rgb.b, rgb.a);

  return {
    hex: hex,
    rgb: rgb,
    hsv: hsv,
  };
}
