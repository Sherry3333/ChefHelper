import axios from 'axios';

const API_URL = "/recipe"; // 请根据你的 C# 后端 URL 修改

export async function fetchRecipes() {
    try {
        const response = await axios.get(API_URL + "/all");

        return response.data; // 返回数据
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