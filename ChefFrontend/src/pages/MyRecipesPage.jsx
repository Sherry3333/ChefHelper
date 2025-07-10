import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoriteContext";
import { toggleFavorite, fetchMyRecipeDetail, fetchMyCreatedRecipes, deleteRecipe, fetchFavoriteRecipes, normalizeRecipeFields } from "../services/recipesServices";
import RecipeDetailSection from "../components/RecipeDetailSection";
import Modal from "../components/Modal";
import RecipeCard from "../components/RecipeCard";
import { useNavigate } from "react-router-dom";

export default function MyRecipesPage() {
  const { isLoggedIn } = useAuth();
  const { isFavorite, updateFavoriteState, refreshFavorites } = useFavorites();
  const [tab, setTab] = useState("saved"); // "saved" or "created"
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const navigate = useNavigate();

  // Fetch recipes based on tab
  const fetchRecipes = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError("");
    
    try {
      if (tab === "saved") {
        const data = await fetchFavoriteRecipes();
        console.log('MyRecipesPage: Fetched favorite recipes:', data);
        const normalizedData = data.map(normalizeRecipeFields);
        console.log('MyRecipesPage: Normalized favorite recipes:', normalizedData);
        setRecipes(normalizedData);
      } else {
        const data = await fetchMyCreatedRecipes();
        console.log('MyRecipesPage: Fetched created recipes:', data);
        const normalizedData = data.map(normalizeRecipeFields);
        console.log('MyRecipesPage: Normalized created recipes:', normalizedData);
        setRecipes(normalizedData);
      }
    } catch (err) {
      setError(err.message || "Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [isLoggedIn, tab]);

  // Handle unfavorite action
  const handleToggleFavorite = async (recipe) => {
    try {
      await toggleFavorite(recipe, true); // Always removing from saved tab
      setRecipes(recipes => recipes.filter(r => r.id !== recipe.id));
      // Refresh the global favorite list to ensure consistency across all pages
      refreshFavorites();
      if (selectedRecipe && selectedRecipe.id === recipe.id) {
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

  // add delete recipe  
  const handleDelete = async (recipe) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    try {
      await deleteRecipe(recipe.id);
      setRecipes(recipes => recipes.filter(r => r.id !== recipe.id));
    } catch (err) {
      setError("Failed to delete recipe");
    }
  };
  
  const handleEdit = (recipe) => {
    navigate(`/create-recipe/${recipe.id}`);
  };

  // Refresh recipes after vote
  const handleVoteUpdate = () => {
    fetchRecipes();
  };

  if (!isLoggedIn) {
    return (
      <main>
        <div className="not-logged-in-message">
          Please login to view your recipes.
        </div>
      </main>
    );
  }

  return (
    <main className="my-recipes-main">
      <h2 className="my-recipes-title">My Recipes</h2>
      <div className="my-recipes-tabs">
        <button
          className={`my-recipes-tab${tab === "saved" ? " active" : ""}`}
          onClick={() => setTab("saved")}
        >
          Saved Recipes
        </button>
        <button
          className={`my-recipes-tab${tab === "created" ? " active" : ""}`}
          onClick={() => setTab("created")}
        >
          My Creations
        </button>
      </div>
      {loading && <div className="my-recipes-loading">Loading...</div>}
      {error && <div className="my-recipes-error">{error}</div>}
      {!loading && !error && (
        tab === "saved" ? (
          <div className="recipe-cards-container">
            <div className="recipe-cards-grid">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.spoonacularId || recipe.id}
                  recipe={recipe}
                  onClick={() => handleCardClick(recipe.id)}
                  isFavorite={true} // These are already favorited recipes
                  onToggleFavorite={() => handleToggleFavorite(recipe)}
                  onVoteUpdate={handleVoteUpdate}
                />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <button className="create-recipe-btn-wide my-recipes-create-btn" onClick={() => navigate("/create-recipe")}>+ Create Your Own Recipe</button>
            </div>
            {recipes.length === 0 ? (
              <div className="my-creations-empty">
                <div className="my-creations-illustration">
                  <img src="/illustration-create-recipe.png" alt="Create Recipe" style={{ maxWidth: 220, marginTop: 24 }} />
                </div>
              </div>
            ) : (
              <div className="recipe-cards-container">
                <div className="recipe-cards-grid">
                  {recipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id || recipe.spoonacularId}
                      recipe={recipe}
                      onClick={() => handleCardClick(recipe.id)}
                      isFavorite={false}
                      onToggleFavorite={undefined}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onVoteUpdate={handleVoteUpdate}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      )}
      <Modal open={!!selectedRecipe} onClose={() => setSelectedRecipe(null)}>
        <RecipeDetailSection
          detail={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onToggleFavorite={selectedRecipe && tab === "saved" ? () => handleToggleFavorite(selectedRecipe) : undefined}
          isFavorite={tab === "saved"}
        />
      </Modal>
    </main>
  );
}
