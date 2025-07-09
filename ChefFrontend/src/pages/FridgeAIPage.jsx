import React from "react";
import FridgeAI from "../components/FridgeAI";
import SearchResults from "../components/SearchResults";
import { fetchRecipeDetail, fetchFavoriteRecipes, addFavorite, removeFavorite, fetchRecipesByIngredients } from "../services/recipesServices";
import { useAuth } from "../context/AuthContext";
import { handleApiError } from "../utils/errorHandler";
import { toast } from 'react-toastify';
import Modal from "../components/Modal";
import RecipeDetailSection from "../components/RecipeDetailSection";
import { getRecipeFromMistral } from "../ai";

export default function FridgeAIPage() {
  const [ingredients, setIngredients] = React.useState([]);
  const [aiResults, setAiResults] = React.useState([]);
  const [activeCardId, setActiveCardId] = React.useState(null);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = React.useState(null);
  const [favoriteIds, setFavoriteIds] = React.useState([]);
  const { isLoggedIn } = useAuth();
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // AI answer state
  const [aiAnswer, setAiAnswer] = React.useState("");
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiError, setAiError] = React.useState("");

  React.useEffect(() => {
    fetchFavoriteRecipes().then(favs => setFavoriteIds(favs.map(r => r.spoonacularId)));
  }, []);

  const handleAddIngredient = (ingredient) => {
    if (ingredient && !ingredients.includes(ingredient)) {
      setIngredients(prev => [...prev, ingredient]);
    }
  };

  const handleRemoveIngredient = (ingredient) => {
    setIngredients(prev => prev.filter(i => i !== ingredient));
  };

  const getRecipe = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setError(null);
    setAiLoading(true);
    setAiError("");
    setAiAnswer("");
    try {
      // Fetch AI answer
      const aiResp = await getRecipeFromMistral(ingredients);
      setAiAnswer(aiResp);
    } catch (err) {
      setAiError(err.message || "AI failed");
    } finally {
      setAiLoading(false);
    }
    try {
      // Fetch recipes from backend
      const recipes = await fetchRecipesByIngredients(ingredients, 8);
      setAiResults(recipes);
    } catch (err) {
      const errorMessage = handleApiError(err, 'ingredients');
      setError(errorMessage);
      setAiResults([]);
    } finally {
      setLoading(false);
    }
  };

  async function handleRecipeClick(id) {
    setActiveCardId(id);
    try {
      const detail = await fetchRecipeDetail(id);
      setSelectedRecipeDetail(detail);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    }
  }

  const toggleFavorite = async (spoonacularId) => {
    if (!isLoggedIn) {
      toast.info("Please login to add favorites.");
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

  return (
    <main>
      <FridgeAI
        ingredients={ingredients}
        onAddIngredient={handleAddIngredient}
        onRemoveIngredient={handleRemoveIngredient}
        onGetRecipe={getRecipe}
        loading={loading}
        hasResults={aiResults && aiResults.length > 0}
      />
      {/* AI Answer Section */}
      <section className="ai-answer-section" style={{maxWidth: 700, margin: '32px auto 0', background: '#fffbe7', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #ffecb3', minHeight: 80}}>
        {aiLoading && <div style={{color: '#d17557'}}>AI is thinking...</div>}
        {aiError && <div style={{color: 'red'}}>{aiError}</div>}
        {!aiLoading && !aiError && aiAnswer && (
          <div style={{fontSize: '1.08rem'}} dangerouslySetInnerHTML={{__html: aiAnswer.replace(/\n/g, '<br/>')}} />
        )}
        {!aiLoading && !aiError && !aiAnswer && <div style={{color: '#aaa'}}>AI will suggest a recipe based on your ingredients.</div>}
      </section>
      {/* Recipe List Section */}
      <section className="fridgeai-results-section">
        {error && <div className="fridgeai-error" style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
        <SearchResults
          searchResults={aiResults}
          onRecipeClick={handleRecipeClick}
          favoriteIds={favoriteIds}
          toggleFavorite={toggleFavorite}
          searchQuery={"FridgeAI"}
        />
      </section>
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
