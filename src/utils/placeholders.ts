export const getRandomPlaceholder = (childName: string): string => {
  // Use the child's name to generate a consistent placeholder for the same child
  const nameHash = childName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // Use the hash to select one of 4 placeholders
  const placeholderIndex = Math.abs(nameHash) % 4 + 1;
  
  return `/placeholders/placeholder-${placeholderIndex}.svg`;
};

export const getRandomPlaceholderFromId = (portfolioId: string): string => {
  // Use the portfolio ID to generate a consistent placeholder
  const idHash = portfolioId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // Use the hash to select one of 4 placeholders
  const placeholderIndex = Math.abs(idHash) % 4 + 1;
  
  return `/placeholders/placeholder-${placeholderIndex}.svg`;
}; 