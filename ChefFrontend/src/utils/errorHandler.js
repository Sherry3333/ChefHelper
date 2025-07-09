import { toast } from 'react-toastify';

/**
 * Unified error handler for API errors
 * @param {Error} error - The error object
 * @param {string} context - Context for the error (e.g., 'search', 'ingredients')
 * @returns {string} - Display message for the error
 */
export const handleApiError = (error, context = '') => {
  // Handle null, undefined, or non-error objects
  if (!error) {
    const displayMessage = 'An unexpected error occurred.';
    toast.error(displayMessage);
    return displayMessage;
  }

  const errorMessage = error.message || 'Unknown error occurred';
  let displayMessage = '';
  let toastType = 'error';

  switch (errorMessage) {
    case 'API_QUOTA_EXCEEDED':
      displayMessage = 'API quota exceeded. Please try again later.';
      toastType = 'error';
      break;
    case 'INVALID_INPUT':
      if (context === 'search') {
        displayMessage = 'Please enter a valid search term.';
      } else if (context === 'ingredients') {
        displayMessage = 'Please enter valid ingredients.';
      } else {
        displayMessage = 'Invalid input provided.';
      }
      toastType = 'warning';
      break;
    case 'SERVER_ERROR':
      displayMessage = 'Server error. Please try again later.';
      toastType = 'error';
      break;
    case 'NETWORK_ERROR':
      displayMessage = 'Network error. Please check your connection.';
      toastType = 'error';
      break;
    default:
      displayMessage = errorMessage;
      toastType = 'error';
  }

  // Show toast notification
  if (toastType === 'error') {
    toast.error(displayMessage);
  } else if (toastType === 'warning') {
    toast.warning(displayMessage);
  }

  return displayMessage;
}; 