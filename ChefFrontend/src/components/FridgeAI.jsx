import React, { useState } from "react";
import { fetchRecipeDetail } from "../services/recipesServices";
import RecipeDetailSection from "./RecipeDetailSection";
import IngredientsList from "./IngredientsList";
import Modal from "./Modal";

export default function FridgeAI({
  ingredients, getRecipe, recipes, handleSaveRecipe, addIngredient, favoriteIds = [], toggleFavorite = () => {}
}) {
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);

  const handleCardClick = async (id) => {
    const detail = await fetchRecipeDetail(id);
    setSelectedRecipeDetail(detail);
  };

  return (
    <section className="fridge-ai-section">
      <h2>Fridge AI</h2>
      <form action={addIngredient} className="add-ingredient-form">
        <input
          type="text"
          placeholder="e.g. orange"
          aria-label="Add ingredient"
          name="ingredient"
        />
        <button>Add ingredient</button>
      </form>
      {ingredients.length > 0 &&
        <IngredientsList
          ingredients={ingredients}
          getRecipe={getRecipe}
          recipes={recipes}
        />
      }
      
      {/* Recipe Cards Display */}
      {recipes && recipes.length > 0 && (
        <div className="recipe-cards-container">
          <h3>Recommended Recipes</h3>
          <div className="recipe-cards-grid">
            {recipes.map((recipe) => {
              const isFavorite = favoriteIds.includes(recipe.spoonacularId);
              return (
                <div
                  key={recipe.spoonacularId}
                  className="recipe-card"
                  onClick={() => handleCardClick(recipe.spoonacularId)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  {recipe.image && (
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="recipe-card-image"
                    />
                  )}
                  <div className="card-footer">
                    <span className="title">{recipe.title}</span>
                    <span
                      className="heart-icon"
                      style={{ color: isFavorite ? 'red' : '#ccc', cursor: 'pointer' }}
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(recipe.spoonacularId);
                      }}
                      title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      {isFavorite ? "❤️" : "🤍"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Recipe Detail Modal */}
      <Modal
        open={!!selectedRecipeDetail}
        onClose={() => setSelectedRecipeDetail(null)}
      >
        {selectedRecipeDetail && (
          <RecipeDetailSection
            detail={selectedRecipeDetail}
            onClose={() => setSelectedRecipeDetail(null)}
                      onToggleFavorite={selectedRecipeDetail ? () => toggleFavorite(selectedRecipeDetail.spoonacularId) : undefined}
          isFavorite={selectedRecipeDetail ? favoriteIds.includes(selectedRecipeDetail.spoonacularId) : false}
          />
        )}
      </Modal>
      
    </section>
  );
}
