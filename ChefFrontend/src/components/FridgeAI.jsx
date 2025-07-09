import React, { useRef } from "react";

export default function FridgeAI({
  ingredients = [],
  onAddIngredient,
  onRemoveIngredient,
  onGetRecipe,
  loading = false,
  hasResults = false
}) {
  const inputRef = useRef();

  const handleAdd = (e) => {
    e.preventDefault();
    const value = inputRef.current.value.trim();
    if (value) {
      onAddIngredient && onAddIngredient(value);
      inputRef.current.value = "";
    }
  };

  return (
    <section className="fridge-ai-section">
      <h2>Fridge AI</h2>
      <form onSubmit={handleAdd} className="add-ingredient-form">
        <input
          type="text"
          placeholder="e.g. orange"
          aria-label="Add ingredient"
          name="ingredient"
          ref={inputRef}
        />
        <button type="submit">Add ingredient</button>
      </form>
      {ingredients.length > 0 && (
        <ul className="ingredients-list">
          {ingredients.map((ing, idx) => (
            <li key={idx}>
              {ing}
              <button
                type="button"
                onClick={() => onRemoveIngredient && onRemoveIngredient(ing)}
                aria-label="Remove ingredient"
                style={{
                  marginLeft: 8,
                  background: "none",
                  border: "none",
                  color: "#b94d2b",
                  fontSize: "1.1em",
                  cursor: "pointer"
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      {/* Show get-recipe-container only if there are ingredients and no results yet */}
      {ingredients.length > 0 && !hasResults && (
        <div className="get-recipe-container">
          <div>
            <h3>Ready for a recipe?</h3>
            <p>Generate a recipe from your list of ingredients.</p>
          </div>
          <button
            onClick={onGetRecipe}
            disabled={loading || ingredients.length === 0}
          >
            {loading ? "Loading..." : "Get a recipe"}
          </button>
        </div>
      )}
    </section>
  );
}
