export const handleSearch = (query: string): void => {
  const trimmedQuery = query.trim();
  if (trimmedQuery) {
    console.log(`Searching for: ${trimmedQuery}`);
    // Add your actual search logic here (e.g., API call)
  } else {
    console.warn('Search query is empty');
  }
};
