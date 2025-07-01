import React, { useState } from "react";
import { deleteRecipe, updateRecipe } from "../services/recipesServices";
import ReactMarkdown from "react-markdown";

export default function SavedRecipes({ recipes = [] }) {
    const [expandedRecipe, setExpandedRecipe] = useState(null);
    const [localRecipes, setLocalRecipes] = useState(recipes);

    // 同步 props 变化
    React.useEffect(() => {
        setLocalRecipes(recipes);
    }, [recipes]);

    async function handleDeleteRecipe(id) {
        try {
            await deleteRecipe(id);
            setLocalRecipes(localRecipes.filter(r => r.id !== id));
        } catch (error) {
            console.error("Error deleting recipe:", error);
        }
    }

    async function handleUpdateRecipe(recipe) {
        const newName = prompt("Enter new name:", recipe.name);
        if (newName && newName !== recipe.name) {
            const updated = { ...recipe, name: newName };
            try {
                await updateRecipe(recipe.id, updated);
                setLocalRecipes(localRecipes.map(r => r.id === recipe.id ? updated : r));
            } catch (error) {
                console.error("Error updating recipe:", error);
            }
        }
    }

    return (
        <div>
            <h1>Saved Recipes</h1>
            <ul>
                {localRecipes.length > 0 ? (
                    localRecipes.map((r) => (
                        <li key={r.id}>
                            <strong>{r.name}</strong> - {r.ingredients}
                            <div>
                                {expandedRecipe === r.id ? (
                                    <ReactMarkdown>{r.content}</ReactMarkdown>
                                ) : (
                                    <p>{r.content?.substring(0, 100)}...</p>
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