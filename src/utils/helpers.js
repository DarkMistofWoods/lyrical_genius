// Function to generate a pastel color
export const generatePastelColor = (index) => {
  const hue = index * 137.508; // Use golden angle approximation
  return `hsl(${hue % 360}, 70%, 80%)`;
};

// Function to get color for a category
export const getCategoryColor = (category, categoryColors) => {
  if (categoryColors[category]) {
    return categoryColors[category];
  }
  const index = Object.keys(categoryColors).length;
  return generatePastelColor(index);
};

export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};