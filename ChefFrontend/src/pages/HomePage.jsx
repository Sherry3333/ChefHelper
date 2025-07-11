import React from "react";
import SeasonalCarousel from "../components/SeasonalCarousel";
import RecipeDetailSection from "../components/RecipeDetailSection";
import Modal from "../components/Modal";
import SearchBar from "../components/SearchBar";
import SearchResults from "../components/SearchResults";
import RecipeCard from "../components/RecipeCard";
import { fetchSeasonalRecipes, fetchRecipeDetail, toggleFavorite, fetchAllUserCreatedRecipes, normalizeRecipeFields } from "../services/recipesServices";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoriteContext";
import { handleApiError } from "../utils/errorHandler";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [seasonalRecipes, setSeasonalRecipes] = React.useState([]);
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCardId, setActiveCardId] = React.useState(null);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [searchError, setSearchError] = React.useState(null);
  const [userCreatedRecipes, setUserCreatedRecipes] = React.useState([]);
  const { isLoggedIn } = useAuth();
  const { isFavorite, updateFavoriteState, refreshFavorites } = useFavorites();
  const navigate = useNavigate();

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        let recipes;
        if (navigator.geolocation) {
          await new Promise(resolve => {
            navigator.geolocation.getCurrentPosition(async (pos) => {
              const { latitude, longitude } = pos.coords;
              try {
                recipes = await fetchSeasonalRecipes(latitude, longitude, 9);
              } catch (err) {
                console.log(err);
                const errorMessage = handleApiError(err);
                setError(errorMessage);
                setLoading(false);
                return;
              }
              resolve();
            }, async (err) => {
              try {
                recipes = await fetchSeasonalRecipes(-36.8485, 174.7633, 9);
              } catch (err) {
                console.log(err);
                const errorMessage = handleApiError(err);
                setError(errorMessage);
                setLoading(false);
                return;
              }
              resolve();
            });
          });
        } else {
          try {
            recipes = await fetchSeasonalRecipes(-36.8485, 174.7633, 9);
          } catch (err) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            setLoading(false);
            return;
          }
        }

       
        setSeasonalRecipes(recipes.map(normalizeRecipeFields));
        
        // get all user created recipes
        const userCreated = await fetchAllUserCreatedRecipes();
        setUserCreatedRecipes(userCreated.map(normalizeRecipeFields));
      } catch (err) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isLoggedIn]);

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

  const handleToggleFavorite = async (recipe) => {
    if (!isLoggedIn) {
      toast.info("Please login to add favorites.");
      return;
    }
    
    const currentFavoriteState = isFavorite(recipe);
    
    try {
      await toggleFavorite(recipe, currentFavoriteState);
      // Refresh the global favorite list to ensure consistency across all pages
      refreshFavorites();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite");
    }
  };

  // Refresh seasonal recipes after vote
  const handleSeasonalVoteUpdate = async () => {
    try {
      let recipes;
      if (navigator.geolocation) {
        await new Promise(resolve => {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
              recipes = await fetchSeasonalRecipes(latitude, longitude, 9);
              console.log('HomePage: Fetched seasonal recipes with geolocation:', recipes);
            } catch (err) {
              console.error('Failed to fetch seasonal recipes with geolocation:', err);
              recipes = await fetchSeasonalRecipes(-36.8485, 174.7633, 9);
            }
            resolve();
          }, async () => {
            try {
              recipes = await fetchSeasonalRecipes(-36.8485, 174.7633, 9);
              console.log('HomePage: Fetched seasonal recipes with default location:', recipes);
            } catch (err) {
              console.error('Failed to fetch seasonal recipes with default location:', err);
            }
            resolve();
          });
        });
      } else {
        recipes = await fetchSeasonalRecipes(-36.8485, 174.7633, 9);
        console.log('HomePage: Fetched seasonal recipes without geolocation:', recipes);
      }

      
      if (recipes) {
        const normalizedRecipes = recipes.map(normalizeRecipeFields);
        setSeasonalRecipes(normalizedRecipes);
      }
    } catch (err) {
      console.error('Failed to refresh seasonal recipes:', err);
    }
  };

  // Refresh user created recipes after vote
  const handleUserCreatedVoteUpdate = async () => {
    try {
      const userCreated = await fetchAllUserCreatedRecipes();
      setUserCreatedRecipes(userCreated.map(normalizeRecipeFields));
    } catch (err) {
      console.error('Failed to refresh user created recipes:', err);
    }
  };

  // Search handlers
  const handleSearchResults = (results) => {
    setSearchResults(results.map(normalizeRecipeFields));
  };

  const handleSearchLoading = (loading) => {
    setSearchLoading(loading);
  };

  const handleSearchError = (error) => {
    const errorMessage = handleApiError(error, 'search');
    setSearchError(errorMessage);
  };

  const handleClearSearchError = () => {
    setSearchError(null);
  };

  const handleSearchQuery = (query) => {
    setSearchQuery(query);
  };

  // react-slick settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        }
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (
    <main>
      {/* Search Section */}
      <div className="search-toolbar">
        <SearchBar 
          className="search-bar-inline"
          onSearchResults={handleSearchResults}
          onLoading={handleSearchLoading}
          onError={handleSearchError}
          onSearchQuery={handleSearchQuery}
          onClearError={handleClearSearchError}
        />
        <button
          className="create-recipe-btn-wide"
          onClick={() => navigate('/create-recipe')}
        >
          + Create Your Own Recipe
        </button>
      </div>
      <div className="search-divider"></div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading seasonal recipes...</p>
        </div>
      )}

      {/* Seasonal Recipes Section */}
      {!loading && !error && seasonalRecipes.length > 0 && (
        <section className="seasonal-section">
          <h2>Seasonal Recipes</h2>
          <SeasonalCarousel
            recipes={seasonalRecipes}
            activeCardId={activeCardId}
            setActiveCardId={setActiveCardId}
            handleRecipeClick={handleRecipeClick}
            sliderSettings={settings}
            toggleFavorite={handleToggleFavorite}
            onVoteUpdate={handleSeasonalVoteUpdate}
          />
        </section>
      )}

      {/* User Created Recipes Section */}
      {!loading && !error && userCreatedRecipes.length > 0 && (
        <section className="user-created-section">
          <h2>User Creations</h2>
          <div className="recipe-cards-container">
            <div className="recipe-cards-grid">
              {userCreatedRecipes.map((recipe) => {
                console.log('HomePage recipe:', recipe);
                return (
                  <RecipeCard
                    key={recipe.spoonacularId || recipe.id}
                    recipe={recipe}
                    onClick={handleRecipeClick}
                    isFavorite={isFavorite(recipe)}
                    onToggleFavorite={handleToggleFavorite}
                    onVoteUpdate={handleUserCreatedVoteUpdate}
                  />
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Search Results Section */}
      {searchResults.length > 0 && (
        <SearchResults
          searchResults={searchResults}
          onRecipeClick={handleRecipeClick}
          toggleFavorite={handleToggleFavorite}
          searchQuery={searchQuery}
          onVoteUpdate={() => {
            // Refresh search results after vote
            if (searchQuery) {
              // Re-trigger search to get updated vote counts
              // This would need to be implemented in SearchBar component
            }
          }}
        />
      )}

      {/* Recipe Detail Modal */}
      <Modal open={!!selectedRecipeDetail} onClose={() => setSelectedRecipeDetail(null)}>
        <RecipeDetailSection
          detail={selectedRecipeDetail}
          onClose={() => setSelectedRecipeDetail(null)}
          onToggleFavorite={selectedRecipeDetail ? () => handleToggleFavorite(selectedRecipeDetail) : undefined}
          isFavorite={selectedRecipeDetail ? isFavorite(selectedRecipeDetail) : false}
        />
      </Modal>
    </main>
  );
}
