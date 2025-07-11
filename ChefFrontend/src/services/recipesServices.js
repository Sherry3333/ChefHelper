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

export async function saveRecipe(title, ingredients, instructions, imageFile) {
    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('ingredients', JSON.stringify(ingredients));
        formData.append('instructions', instructions);
        if (imageFile) formData.append('image', imageFile);
        const response = await axiosInstance.post(
            API_URL + "/add",
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
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
        const formData = new FormData();
        formData.append('title', updatedRecipe.title);
        formData.append('ingredients', JSON.stringify(updatedRecipe.ingredients));
        formData.append('instructions', updatedRecipe.instructions);
        // only append image if it's a File
        if (updatedRecipe.image instanceof File) {
            formData.append('image', updatedRecipe.image);
        }
        const response = await axiosInstance.put(
            `${API_URL}/${id}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        console.log(`Recipe with id ${id} updated`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error updating recipe with id ${id}:`, error);
        return null;
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

// Helper to build favorite/vote request body
function buildRecipeKey(recipe) {
  const id = recipe.id || null;
  // spoonacularId 始终为数字
  const spoonacularId = recipe.spoonacularId ? Number(recipe.spoonacularId) : (recipe.SpoonacularId ? Number(recipe.SpoonacularId) : null);
  return {
    recipeId: id ? id : null,
    spoonacularId: !id && spoonacularId ? spoonacularId : null
  };
}

// --- Favorite-related API ---

export async function fetchFavoriteRecipes() {
    try {
        const response = await axiosInstance.get('/favorites');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch favorite recipes:', error);
        return [];
    }
}

// Add a recipe to favorites (requires JWT)
export async function addFavorite(recipe) {
    try {
        await axiosInstance.post('/favorites', buildRecipeKey(recipe));
    } catch (error) {
        console.error('Failed to add favorite:', error);
        throw error;
    }
}

// Remove a recipe from favorites (requires JWT)
export async function removeFavorite(recipe) {
    try {
        await axiosInstance.delete('/favorites', {
            data: buildRecipeKey(recipe)
        });
    } catch (error) {
        console.error('Failed to remove favorite:', error);
        throw error;
    }
}

// --- Vote-related API ---

export async function addVote(recipe) {
    await axiosInstance.post('/votes', buildRecipeKey(recipe));
}

export async function removeVote(recipe) {
    await axiosInstance.delete('/votes', {
        data: buildRecipeKey(recipe)
    });
}

export async function fetchVoteStatus(recipe) {
    const requestBody = buildRecipeKey(recipe);
    console.log('fetchVoteStatus request body:', requestBody, 'for recipe:', recipe);
    const res = await axiosInstance.post('/votes/status', requestBody);
    return res.data;
}

export async function fetchVoteCount(recipe) {
    const res = await axiosInstance.post('/votes/count', buildRecipeKey(recipe));
    return res.data;
}

export async function fetchMyRecipeDetail(id) {
    const res = await axiosInstance.get(`/myrecipe/${id}`);
    return res.data;
}

export async function fetchMyCreatedRecipes() {
  try {
    const response = await axiosInstance.get('/myrecipe/mine');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch my created recipes:', error);
    return [];
  }
}

export async function fetchAllUserCreatedRecipes() {
    try {
        const response = await axiosInstance.get('/myrecipe/allUserCreated');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch all user created recipes:', error);
        return [];
    }
}

// Helper function to build a unique key for favorites
export function buildFavoriteKey(recipe) {
  // spoonacularId 
  const id = recipe.id || null;
  const spoonacularId = recipe.spoonacularId ? Number(recipe.spoonacularId) : (recipe.SpoonacularId ? Number(recipe.SpoonacularId) : null);
  return id ? `local-${id}` : `spoon-${spoonacularId}`;
}

// Unified toggle favorite function
export async function toggleFavorite(recipe, isFavorite) {
  if (isFavorite) {
    return await removeFavorite(recipe);
  } else {
    return await addFavorite(recipe);
  }
}

// Normalize recipe fields to always have id and spoonacularId
export function normalizeRecipeFields(recipe) {
  return {
    ...recipe,
    id: recipe.id || null,
    spoonacularId: recipe.spoonacularId ? Number(recipe.spoonacularId) : (recipe.SpoonacularId ? Number(recipe.SpoonacularId) : null)
  };
}