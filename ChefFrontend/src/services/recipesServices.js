import axios from './axiosInstance';

// All API calls use relative paths for proxy-based development
const API_URL = "/myrecipe"; 

// Helper to get JWT token from localStorage for Authorization header
function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchRecipes() {
    try {
        const response = await axios.get(API_URL + "/all");
        return response.data; 
    } catch (error) {
        console.error("Failed to fetch recipes:", error);
        return [];  
    }
}

export async function saveRecipe(name, ingredients, content) {
    try {
        const response = await axios.post(API_URL + "/add", {
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
        await axios.delete(`${API_URL}/${id}`);
        console.log(`Recipe with id ${id} deleted`);
    } catch (error) {
        console.error(`Error deleting recipe with id ${id}:`, error);
    }
}

export async function updateRecipe(id, updatedRecipe) {
    try {
        const response = await axios.put(`${API_URL}/${id}`, updatedRecipe);
        console.log(`Recipe with id ${id} updated`, response.data);
    } catch (error) {
        console.error(`Error updating recipe with id ${id}:`, error);
    }
}

// Fetch seasonal recipes from backend
export async function fetchSeasonalRecipes(latitude, longitude, count = 9) {
    try {
        const response = await axios.post('/recipes/seasonal', {
            latitude,
            longitude,
            count
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch seasonal recipes:', error);
        return [];
    }
}

export async function fetchRecipeDetail(id) {
    try {
        const response = await axios.get(`/recipes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch recipe detail:', error);
        return null;
    }
}

// Fetch recipes by ingredients from backend
export async function fetchRecipesByIngredients(ingredients, count = 3) {
    try {
        const response = await axios.post('/recipes/byIngredients', {
            ingredients: ingredients.join(','),
            count
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch recipes by ingredients:', error);
        return [];
    }
}

// --- Favorite-related API ---

// Get all favorite recipes for current user (requires JWT)
export async function fetchFavoriteRecipes() {
    try {
        const response = await axios.get('/favorites', {
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
        await axios.post(`/favorites/${spoonacularId}`, {}, {
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
        await axios.delete(`/favorites/${spoonacularId}`, {
            headers: getAuthHeader()
        });
    } catch (error) {
        console.error('Failed to remove favorite:', error);
        throw error;
    }
}

export async function fetchMyRecipeDetail(id) {
    const res = await axios.get(`/myrecipe/${id}`);
    return res.data;
}