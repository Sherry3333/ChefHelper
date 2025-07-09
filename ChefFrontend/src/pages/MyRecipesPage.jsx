import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchFavoriteRecipes, removeFavorite, fetchMyRecipeDetail } from "../services/recipesServices";
import RecipeDetailSection from "../components/RecipeDetailSection";
import Modal from "../components/Modal";
import RecipeCard from "../components/RecipeCard";

export default function MyRecipesPage() {
  const { isLoggedIn } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Fetch favorite recipes on mount or login state change
  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError("");
    fetchFavoriteRecipes()
      .then(data => setRecipes(data))
      .catch(err => setError(err.message || "Failed to load favorites"))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  // Handle unfavorite action
  const handleUnfavorite = async (spoonacularId) => {
    try {
      await removeFavorite(spoonacularId);
      setRecipes(recipes => recipes.filter(r => r.spoonacularId !== spoonacularId));
      // If the detail view is open for this recipe, close it
      if (selectedRecipe && selectedRecipe.spoonacularId === spoonacularId) {
        setSelectedRecipe(null);
      }
    } catch (error) {
      setError((error.response && error.response.data && error.response.data.error) || error.message || "Failed to remove favorite.");
    }
  };

  // Handle card click to fetch and show detail
  const handleCardClick = async (id) => {
    if (!id) {
      setError("This recipe is missing database ID, cannot view details.");
      return;
    }
    try {
      const detail = await fetchMyRecipeDetail(id);
      setSelectedRecipe(detail);
    } catch (err) {
      setError((err.response && err.response.data && err.response.data.error) || err.message || 'Failed to fetch recipe detail');
    }
  };

  if (!isLoggedIn) {
    return (
      <main>
        <div className="not-logged-in-message">
          Please login to view your favorite recipes.
        </div>
      </main>
    );
  }

  return (
    <main>
      <h2 className="my-recipes-title">My Favorite Recipes</h2>
      {loading && <div className="my-recipes-loading">Loading...</div>}
      {error && <div className="my-recipes-error">{error}</div>}
      {!loading && !error && (
        <div className="recipe-cards-container">
          <div className="recipe-cards-grid">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.spoonacularId || recipe.id}
                recipe={recipe}
                onClick={() => handleCardClick(recipe.id)}
                isFavorite={true}
                onToggleFavorite={() => handleUnfavorite(recipe.spoonacularId)}
              />
            ))}
          </div>
        </div>
      )}
      <Modal open={!!selectedRecipe} onClose={() => setSelectedRecipe(null)}>
        <RecipeDetailSection
          detail={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onToggleFavorite={selectedRecipe ? () => handleUnfavorite(selectedRecipe.spoonacularId) : undefined}
          isFavorite={true}
        />
      </Modal>
    </main>
  );
}
