import React from "react";
import IngredientsList from "../components/IngredientsList";
import ClaudeRecipe from "../components/ClaudeRecipe";
import { getRecipeFromMistral } from "../ai";
import { saveRecipe } from "../hooks/recipesServices";

export default function FridgeAIPage() {
  const [ingredients, setIngredients] = React.useState([]);
  const [recipe, setRecipe] = React.useState("");

  function addIngredient(formData) {
    const newIngredient = formData.get("ingredient");
    setIngredients(prev => [...prev, newIngredient]);
  }

  async function getRecipe() {
    const recipeMarkdown = await getRecipeFromMistral(ingredients);
    setRecipe(recipeMarkdown);
  }

  async function handleSaveRecipe() {
    const recipeName = prompt("Enter a name for your recipe:");
    if (!recipeName) {
      alert("Recipe name cannot be empty.");
      return;
    }
    try {
      await saveRecipe(recipeName, ingredients.join(", "), recipe);
      alert("Recipe saved!");
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  }

  return (
    <main>
      <section className="fridge-ai-section">
        <h2>Fridge AI</h2>
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
      </section>
    </main>
  );
}
