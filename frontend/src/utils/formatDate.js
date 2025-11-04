/**
 * Formats a date string into a more readable format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string (e.g., "January 1, 2023")
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

export default formatDate;
