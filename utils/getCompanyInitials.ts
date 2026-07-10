export function getCompanyInitials(companyName: string): string {
  if (!companyName || typeof companyName !== 'string') return '';

  const ignoreWords = [
    'pvt', 'ltd', 'llp', 'private', 'limited', 'company', 'co', 'co.', 'industries', 'enterprise', 'enterprises'
  ];

  // Split by whitespace and filter out ignored words (case-insensitive)
  const words = companyName
    .trim()
    .split(/\s+/)
    .filter(word => {
      // Remove punctuation for comparison
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      return cleanWord.length > 0 && !ignoreWords.includes(cleanWord);
    });

  if (words.length === 0) {
    // Fallback if all words are ignored, use the original first two letters
    return companyName.substring(0, 2).toUpperCase();
  }

  if (words.length === 1) {
    // If only one word, use the first two letters
    return words[0].substring(0, 2).toUpperCase();
  }

  // Use the first letter of the first 2-4 words
  const initials = words.slice(0, 4).map(word => word[0]).join('');
  
  return initials.toUpperCase();
}
