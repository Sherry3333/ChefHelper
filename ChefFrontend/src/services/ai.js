import axiosInstance from './axiosInstance';

// Function to get recipe suggestion from backend API
export async function getRecipeFromOpenAI(ingredientsArr) {
  // Call backend endpoint at /ai/get using axiosInstance
  const response = await axiosInstance.post('/ai/get', {
    ingredients: ingredientsArr,
  });
  // Return the recipe string
  return response.data.recipe;
} 