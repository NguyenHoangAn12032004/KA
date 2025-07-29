/**
 * Accessibility utility functions
 */

/**
 * Calculate the contrast ratio between two colors
 * @param foreground - Foreground color in hex format (e.g., #FFFFFF)
 * @param background - Background color in hex format (e.g., #000000)
 * @returns Contrast ratio as a number
 */
export const getContrastRatio = (foreground: string, background: string): number => {
  // Convert hex to RGB
  const hexToRgb = (hex: string): number[] => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  // Calculate relative luminance
  const getLuminance = (rgb: number[]): number => {
    const [r, g, b] = rgb.map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const rgb1 = hexToRgb(foreground);
  const rgb2 = hexToRgb(background);
  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);

  // Calculate contrast ratio
  const ratio = l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
  return Math.round(ratio * 100) / 100;
};

/**
 * Ensure text color has sufficient contrast with background
 * @param textColor - Text color in hex format
 * @param backgroundColor - Background color in hex format
 * @param minRatio - Minimum contrast ratio (WCAG AA requires 4.5:1 for normal text)
 * @returns Text color with sufficient contrast
 */
export const ensureTextContrast = (
  textColor: string, 
  backgroundColor: string, 
  minRatio: number = 4.5
): string => {
  const initialRatio = getContrastRatio(textColor, backgroundColor);
  
  if (initialRatio >= minRatio) {
    return textColor;
  }
  
  // If contrast is insufficient, return either black or white based on background
  const bgRgb = backgroundColor.slice(1).match(/.{2}/g)?.map(val => parseInt(val, 16)) || [0, 0, 0];
  const brightness = (bgRgb[0] * 299 + bgRgb[1] * 587 + bgRgb[2] * 114) / 1000;
  
  return brightness > 125 ? '#000000' : '#FFFFFF';
};

/**
 * Check if a color meets WCAG AA contrast requirements
 * @param foreground - Foreground color in hex format
 * @param background - Background color in hex format
 * @param isLargeText - Whether the text is large (14pt bold or 18pt regular)
 * @returns Boolean indicating if the contrast meets WCAG AA requirements
 */
export const meetsWcagAA = (foreground: string, background: string, isLargeText: boolean = false): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};

/**
 * Check if a color meets WCAG AAA contrast requirements
 * @param foreground - Foreground color in hex format
 * @param background - Background color in hex format
 * @param isLargeText - Whether the text is large (14pt bold or 18pt regular)
 * @returns Boolean indicating if the contrast meets WCAG AAA requirements
 */
export const meetsWcagAAA = (foreground: string, background: string, isLargeText: boolean = false): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
};

/**
 * Adjust color brightness
 * @param color - Color in hex format
 * @param factor - Factor to adjust brightness (negative for darker, positive for lighter)
 * @returns Adjusted color in hex format
 */
export const adjustBrightness = (color: string, factor: number): string => {
  const hex = color.slice(1);
  const rgb = hex.match(/.{2}/g)?.map(val => parseInt(val, 16)) || [0, 0, 0];
  
  const newRgb = rgb.map(val => {
    const adjusted = Math.round(val + factor * 255);
    return Math.max(0, Math.min(255, adjusted));
  });
  
  return `#${newRgb.map(val => val.toString(16).padStart(2, '0')).join('')}`;
}; 