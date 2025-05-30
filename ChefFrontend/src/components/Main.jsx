import React from "react"
import IngredientsList from "./IngredientsList"
import ClaudeRecipe from "./ClaudeRecipe"
import { getRecipeFromMistral } from "../ai"
import { saveRecipe } from "/src/hooks/recipesServices.js";
import { useNavigate } from "react-router-dom";

export default function Main() {
    const navigate = useNavigate();
    const [ingredients, setIngredients] = React.useState([])
    const [recipe, setRecipe] = React.useState("")

    async function getRecipe() {
        console.log("Getting recipe...")
        const recipeMarkdown = await getRecipeFromMistral(ingredients)
        setRecipe(recipeMarkdown)
    }

    async function handleSaveRecipe() {
        const recipeName = prompt("Enter a name for your recipe:");  
        
        if (!recipeName) {
            alert("Recipe name cannot be empty.");
            return;
        }
        try {
            await saveRecipe(recipeName,ingredients.join(", "), recipe);
            alert("Recipe saved!");
            navigate("/saved"); 
        } catch (error) {
            console.error("Error saving recipe:", error);
        }
    }

    function addIngredient(formData) {
        const newIngredient = formData.get("ingredient")
        setIngredients(prevIngredients => [...prevIngredients, newIngredient])
    }

    return (
        <main>
            <form action={addIngredient} className="add-ingredient-form">
                <input
                    type="text"
                    placeholder="e.g. oregano"
                    aria-label="Add ingredient"
                    name="ingredient"
                />
                <button>Add ingredient</button>
            </form>

            {ingredients.length > 0 &&
                <IngredientsList
                    ingredients={ingredients}
                    getRecipe={getRecipe}
                />
            }

            {recipe && <ClaudeRecipe recipe={recipe} />}

            {recipe && (
                <div>
                    <button className="save-recipe-btn" onClick={handleSaveRecipe}>Save Recipe</button>
                </div>
            )}

        </main>
    )
}