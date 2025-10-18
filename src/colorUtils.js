// Color conversion utilities

/**
 * Converts HSV color to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-1)
 * @param {number} v - Value/Lightness (0-1)
 * @returns {object} RGB values {r, g, b}
 */
export function hsvToRgb(h, s, v) {
  h = h / 360; // Normalize hue to 0-1
  const c = v * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = v - c;
  
  let r, g, b;
  
  if (h * 6 < 1) {
    r = c; g = x; b = 0;
  } else if (h * 6 < 2) {
    r = x; g = c; b = 0;
  } else if (h * 6 < 3) {
    r = 0; g = c; b = x;
  } else if (h * 6 < 4) {
    r = 0; g = x; b = c;
  } else if (h * 6 < 5) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

/**
 * Converts RGB color to HSV
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {object} HSV values {h, s, v}
 */
export function rgbToHsv(r, g, b) {
  r = r / 255;
  g = g / 255;
  b = b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  
  if (diff !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / diff) % 6;
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  
  return { h, s, v };
}

/**
 * Converts RGB to HEX
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} HEX color string
 */
export function rgbToHex(r, g, b) {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}

/**
 * Converts HEX to RGB
 * @param {string} hex - HEX color string
 * @returns {object} RGB values {r, g, b}
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Creates a gradient color for the saturation/lightness area
 * @param {number} hue - Hue (0-360)
 * @returns {string} CSS gradient string
 */
export function createSaturationGradient(hue) {
  const { r, g, b } = hsvToRgb(hue, 1, 1);
  return `linear-gradient(to bottom, 
    rgba(255, 255, 255, 1) 0%, 
    rgba(${r}, ${g}, ${b}, 1) 100%
  ), linear-gradient(to right, 
    rgba(0, 0, 0, 1) 0%, 
    rgba(0, 0, 0, 0) 100%
  )`;
}
