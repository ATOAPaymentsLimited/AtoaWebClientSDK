export const getContrastColor = (hexColor: string | undefined | null): string => {
  if (!hexColor) {
    return '#FFFFFF'; // Default to white text if no background color
  }

  // Remove the hash at the start if it exists
  hexColor = hexColor.replace(/^#/, '');

  // Parse r, g, b values
  let r = 0, g = 0, b = 0;
  if (hexColor.length === 3) {
    r = parseInt(hexColor[0] + hexColor[0], 16);
    g = parseInt(hexColor[1] + hexColor[1], 16);
    b = parseInt(hexColor[2] + hexColor[2], 16);
  } else if (hexColor.length === 6) {
    r = parseInt(hexColor.substring(0, 2), 16);
    g = parseInt(hexColor.substring(2, 4), 16);
    b = parseInt(hexColor.substring(4, 6), 16);
  } else {
     return '#FFFFFF'; // Return default for invalid hex code
  }

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};