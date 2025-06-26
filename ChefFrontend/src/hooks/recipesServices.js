import axios from 'axios';

// All API calls use relative paths for proxy-based development
const API_URL = "/recipe"; 

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
        const response = await axios.post('/season/recipes', {
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
        const response = await axios.get(`/season/recipes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch recipe detail:', error);
        return null;
    }
}