import React from "react";
import SeasonalCarousel from "../components/SeasonalCarousel";
import RecipeDetailSection from "../components/RecipeDetailSection";
import Modal from "../components/Modal";
import SearchBar from "../components/SearchBar";
import SearchResults from "../components/SearchResults";
import { fetchSeasonalRecipes, fetchRecipeDetail, fetchFavoriteRecipes, addFavorite, removeFavorite } from "../services/recipesServices";
import { useAuth } from "../context/AuthContext";
import { handleApiError } from "../utils/errorHandler";
import { toast } from 'react-toastify';

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
  const [favoriteIds, setFavoriteIds] = React.useState([]);
  const { isLoggedIn } = useAuth();

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
        setSeasonalRecipes(recipes);
        const favs = await fetchFavoriteRecipes();
        setFavoriteIds(favs.map(r => r.spoonacularId));
      } catch (err) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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

  // Search handlers
  const handleSearchResults = (results) => {
    setSearchResults(results);
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
      <section className="search-section" style={{ marginBottom: '30px' }}>
        <SearchBar 
          onSearchResults={handleSearchResults}
          onLoading={handleSearchLoading}
          onError={handleSearchError}
          onSearchQuery={handleSearchQuery}
          onClearError={handleClearSearchError}
        />
        {searchError && (
          <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
            {searchError}
          </p>
        )}
        {searchLoading && (
          <p style={{ textAlign: 'center', marginTop: '10px' }}>
            Searching recipes...
          </p>
        )}
      </section>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <SearchResults
          searchResults={searchResults}
          onRecipeClick={handleRecipeClick}
          favoriteIds={favoriteIds}
          toggleFavorite={toggleFavorite}
          searchQuery={searchQuery}
        />
      )}

      {/* Seasonal Recipes Section */}
      <section className="seasonal-carousel-section">
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ flex: 1 }}>Seasonal Recipes</h2>
        </div>
        {loading && <p>Loading seasonal recipes...</p>}
        {error && <p style={{color: 'red', fontWeight: 'bold'}}>{error}</p>}
        <SeasonalCarousel
          recipes={seasonalRecipes}
          activeCardId={activeCardId}
          setActiveCardId={setActiveCardId}
          handleRecipeClick={handleRecipeClick}
          sliderSettings={settings}
          favoriteIds={favoriteIds}
          toggleFavorite={toggleFavorite}
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
