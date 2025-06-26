import IngredientsList from "./IngredientsList";
import ClaudeRecipe from "./ClaudeRecipe";

export default function FridgeAI({
  ingredients, setIngredients, getRecipe, recipe, handleSaveRecipe, addIngredient
}) {
  return (
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
  );
}
