/**
 * Utility functions for color manipulation
 */

// Convert hex color to RGB
export const hexToRgb = (hex) => {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse the hex values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    
    return { r, g, b };
  };
  
  // Convert RGB to hex
  export const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };
  
  // Generate a lighter shade of a color
  export const lightenColor = (hex, amount = 0.2) => {
    const { r, g, b } = hexToRgb(hex);
    const lightR = Math.min(255, Math.floor(r + (255 - r) * amount));
    const lightG = Math.min(255, Math.floor(g + (255 - g) * amount));
    const lightB = Math.min(255, Math.floor(b + (255 - b) * amount));
    
    return rgbToHex(lightR, lightG, lightB);
  };
  
  // Generate a darker shade of a color
  export const darkenColor = (hex, amount = 0.2) => {
    const { r, g, b } = hexToRgb(hex);
    const darkR = Math.max(0, Math.floor(r * (1 - amount)));
    const darkG = Math.max(0, Math.floor(g * (1 - amount)));
    const darkB = Math.max(0, Math.floor(b * (1 - amount)));
    
    return rgbToHex(darkR, darkG, darkB);
  };
  
  // Get complementary color
  export const getComplementaryColor = (hex) => {
    const { r, g, b } = hexToRgb(hex);
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;
    
    return rgbToHex(compR, compG, compB);
  };
  
  // Common color schemes for rooms
  export const roomColorSchemes = {
    modern: ['#FFFFFF', '#000000', '#EEEEEE', '#333333'],
    warm: ['#F5E1DA', '#E8C4A2', '#A67F5D', '#6B4226'],
    cool: ['#E6F4F1', '#BFE3DE', '#7ABFB3', '#37867A'],
    vibrant: ['#F4EDEA', '#EAC435', '#345995', '#FB4D3D'],
    minimal: ['#FFFFFF', '#EEEEEE', '#DDDDDD', '#CCCCCC'],
  };
  
  // Get a color scheme based on a base color
  export const generateColorScheme = (baseHex, type = 'complementary') => {
    const scheme = [];
    scheme.push(baseHex);
    
    if (type === 'complementary') {
      scheme.push(getComplementaryColor(baseHex));
    } else if (type === 'monochromatic') {
      scheme.push(lightenColor(baseHex, 0.3));
      scheme.push(darkenColor(baseHex, 0.3));
    } else if (type === 'analogous') {
      // Simplified version - in a real app, you'd use HSL color space for this
      scheme.push(lightenColor(baseHex, 0.2));
      scheme.push(darkenColor(baseHex, 0.2));
    }
    
    return scheme;
  };

  // In colorUtils.js, add this function

  