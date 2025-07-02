import React, { useEffect, useState } from "react";
import FridgeAI from "../components/FridgeAI";
import RecipeDetailSection from "../components/RecipeDetailSection";
import Modal from "../components/Modal";
import { fetchRecipesByIngredients, saveRecipe, fetchFavoriteRecipes, addFavorite, removeFavorite, fetchRecipeDetail } from "../services/recipesServices";
import { useAuth } from "../context/AuthContext";

export default function FridgeAIPage() {
  const [ingredients, setIngredients] = React.useState([]);
  const [recipes, setRecipes] = React.useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]); // Store spoonacularIds
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);
  const { isLoggedIn } = useAuth();
  const [error, setError] = useState(null);

  // Fetch user favorites on mount
  useEffect(() => {
    fetchFavoriteRecipes().then(favs => {
      setFavoriteIds(favs.map(r => r.spoonacularId));
    });
  }, []);

  function addIngredient(formData) {
    const newIngredient = formData.get("ingredient");
    setIngredients(prev => [...prev, newIngredient]);
  }

  async function getRecipe() {
    try {
      const recipesData = await fetchRecipesByIngredients(ingredients, 8);
      setRecipes(recipesData);
    } catch (error) {
      setError((error.response && error.response.data && error.response.data.error) || error.message || 'Failed to load data');
      setRecipes([]); // clear the previous recipes
    }
  }

  async function handleSaveRecipe() {
    const recipeName = prompt("Enter a name for your recipe:");
    if (!recipeName) {
      return;
    }
    try {
      await saveRecipe(recipeName, ingredients.join(", "), "Recipe content");
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  }

  // Toggle favorite/unfavorite for a recipe
  const toggleFavorite = async (spoonacularId) => {
    if (!isLoggedIn) {
      return;
    }
    if (favoriteIds.includes(spoonacularId)) {
      await removeFavorite(spoonacularId);
      setFavoriteIds(ids => ids.filter(id => id !== spoonacularId));
    } else {
      await addFavorite(spoonacularId);
      setFavoriteIds(ids => [...ids, spoonacularId]);
    }
  };

  // Handle card click to show detail modal
  async function handleRecipeClick(spoonacularId) {
    try {
      const detail = await fetchRecipeDetail(spoonacularId);
      setSelectedRecipeDetail(detail);
    } catch (err) {
      setError((err.response && err.response.data && err.response.data.error) || err.message || 'Failed to fetch recipe detail');
    }
  }

  return (
    <main>
      <FridgeAI
        ingredients={ingredients}
        setIngredients={setIngredients}
        getRecipe={getRecipe}
        recipes={recipes}
        handleSaveRecipe={handleSaveRecipe}
        addIngredient={addIngredient}
        favoriteIds={favoriteIds}
        toggleFavorite={toggleFavorite}
        handleRecipeClick={handleRecipeClick}
      />
      <Modal open={!!selectedRecipeDetail} onClose={() => setSelectedRecipeDetail(null)}>
        <RecipeDetailSection
          detail={selectedRecipeDetail}
          onClose={() => setSelectedRecipeDetail(null)}
          onToggleFavorite={selectedRecipeDetail ? () => toggleFavorite(selectedRecipeDetail.spoonacularId) : undefined}
          isFavorite={selectedRecipeDetail ? favoriteIds.includes(selectedRecipeDetail.spoonacularId) : false}
        />
      </Modal>
    </main>
  );
}
