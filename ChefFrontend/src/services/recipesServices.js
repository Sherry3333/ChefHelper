import axiosInstance from './axiosInstance';

// All API calls use relative paths for proxy-based development
const API_URL = "/myrecipe"; 

// Helper to get JWT token from localStorage for Authorization header
function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchRecipes() {
    try {
        const response = await axiosInstance.get(API_URL + "/all");
        return response.data; 
    } catch (error) {
        console.error("Failed to fetch recipes:", error);
        return [];  
    }
}

export async function saveRecipe(name, ingredients, content) {
    try {
        const response = await axiosInstance.post(API_URL + "/add", {
            name,
            ingredients,
            content
        });
        return response.data;  
    } catch (error) {
        console.error("Error saving recipe:", error);
        return null;  
    }
}

export async function deleteRecipe(id) {
    try {
        await axiosInstance.delete(`${API_URL}/${id}`);
        console.log(`Recipe with id ${id} deleted`);
    } catch (error) {
        console.error(`Error deleting recipe with id ${id}:`, error);
    }
}

export async function updateRecipe(id, updatedRecipe) {
    try {
        const response = await axiosInstance.put(`${API_URL}/${id}`, updatedRecipe);
        console.log(`Recipe with id ${id} updated`, response.data);
    } catch (error) {
        console.error(`Error updating recipe with id ${id}:`, error);
    }
}

// Fetch seasonal recipes from backend
export async function fetchSeasonalRecipes(latitude, longitude, count = 9) {
    try {
        const response = await axiosInstance.post('/recipes/seasonal', {
            latitude,
            longitude,
            count
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch seasonal recipes:', error);
        
        // Handle specific error cases by status code
        if (error.response) {
            if (error.response.status === 402) {
                throw new Error('API_QUOTA_EXCEEDED');
            } else if (error.response.status >= 500) {
                throw new Error('SERVER_ERROR');
            }
        }
        
        throw new Error('NETWORK_ERROR');
    }
}

export async function fetchRecipeDetail(id) {
    try {
        const response = await axiosInstance.get(`/recipes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch recipe detail:', error);
        
        // Handle specific error cases by status code
        if (error.response) {
            if (error.response.status === 402) {
                throw new Error('API_QUOTA_EXCEEDED');
            } else if (error.response.status >= 500) {
                throw new Error('SERVER_ERROR');
            }
        }
        
        throw new Error('NETWORK_ERROR');
    }
}

// Fetch recipes by ingredients from backend
export async function fetchRecipesByIngredients(ingredients, count = 3) {
    try {
        const response = await axiosInstance.post('/recipes/byIngredients', {
            ingredients: ingredients.join(','),
            count
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch recipes by ingredients:', error);
        
        // Handle specific error cases by status code
        if (error.response) {
            if (error.response.status === 402) {
                throw new Error('API_QUOTA_EXCEEDED');
            } else if (error.response.status === 400) {
                throw new Error('INVALID_INPUT');
            } else if (error.response.status >= 500) {
                throw new Error('SERVER_ERROR');
            }
        }
        
        throw new Error('NETWORK_ERROR');
    }
}

// Search recipes by query from backend
export async function searchRecipes(query, count = 10) {
    try {
        const response = await axiosInstance.post('/recipes/search', {
            query,
            count
        });
        return response.data;
    } catch (error) {
        console.error('Failed to search recipes:', error);
        
        // Handle specific error cases by status code
        if (error.response) {
            if (error.response.status === 402) {
                throw new Error('API_QUOTA_EXCEEDED');
            } else if (error.response.status === 400) {
                throw new Error('INVALID_INPUT');
            } else if (error.response.status >= 500) {
                throw new Error('SERVER_ERROR');
            }
        }
        
        throw new Error('NETWORK_ERROR');
    }
}

// --- Favorite-related API ---

// Get all favorite recipes for current user (requires JWT)
export async function fetchFavoriteRecipes() {
    try {
        const response = await axiosInstance.get('/favorites', {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch favorite recipes:', error);
        return [];
    }
}

// Add a recipe to favorites (requires JWT)
export async function addFavorite(spoonacularId) {
    try {
        await axiosInstance.post(`/favorites/${spoonacularId}`, {}, {
            headers: getAuthHeader()
        });
    } catch (error) {
        console.error('Failed to add favorite:', error);
        throw error;
    }
}

// Remove a recipe from favorites (requires JWT)
export async function removeFavorite(spoonacularId) {
    try {
        await axiosInstance.delete(`/favorites/${spoonacularId}`, {
            headers: getAuthHeader()
        });
    } catch (error) {
        console.error('Failed to remove favorite:', error);
        throw error;
    }
}

export async function fetchMyRecipeDetail(id) {
    const res = await axiosInstance.get(`/myrecipe/${id}`);
    return res.data;
}

export async function addVote(recipeId) {
  await axiosInstance.post(`/votes/${recipeId}`, {}, {
    headers: getAuthHeader()
  });
}

export async function removeVote(recipeId) {
  await axiosInstance.delete(`/votes/${recipeId}`, {
    headers: getAuthHeader()
  });
}