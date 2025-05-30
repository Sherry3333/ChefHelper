import React, { useState, useEffect } from "react";
import { fetchRecipes, deleteRecipe, updateRecipe } from "/src/hooks/recipesServices.js";
import ReactMarkdown from "react-markdown"

export default function SavedRecipes() {
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);
    const [expandedRecipe, setExpandedRecipe] = useState(null); 

    useEffect(() => {
        async function loadRecipes() {
            try {
                const recipes = await fetchRecipes();
                setFavoriteRecipes(recipes);
            } catch (error) {
                console.error("Error fetching recipes:", error);
            }
        }
        loadRecipes();
    }, []);

    async function handleDeleteRecipe(id) {
        try {
            await deleteRecipe(id);
            setFavoriteRecipes(await fetchRecipes());
        } catch (error) {
            console.error("Error deleting recipe:", error);
        }
    }

    async function handleUpdateRecipe(recipe) {
        const newName = prompt("Enter new name:");
        if (newName) {
            recipe.name = newName;
            try {
                await updateRecipe(recipe.id, recipe);
                setFavoriteRecipes(await fetchRecipes());
            } catch (error) {
                console.error("Error updating recipe:", error);
            }
        }
    }

    return (
        <div>
            <h1>Saved Recipes</h1>
            <ul>
                {favoriteRecipes.length > 0 ? (
                    favoriteRecipes.map((r) => (
                        <li key={r.id}>
                            <strong>{r.name}</strong> - {r.ingredients}
                            <div>
                                {expandedRecipe === r.id ? (
                                    <ReactMarkdown>{r.content}</ReactMarkdown> 
                                ) : (
                                    <p>{r.content.substring(0, 100)}...</p> 
                                )}
                                <button onClick={() => setExpandedRecipe(expandedRecipe === r.id ? null : r.id)}>
                                    {expandedRecipe === r.id ? "Hide" : "View Details"}
                                </button>
                            </div>
                            <button onClick={() => handleDeleteRecipe(r.id)}>❌ Delete</button>
                            <button onClick={() => handleUpdateRecipe(r)}>✏️ Edit</button>
                        </li>
                    ))
                ) : (
                    <p>No saved recipes yet.</p>
                )}
            </ul>
        </div>
    );
}