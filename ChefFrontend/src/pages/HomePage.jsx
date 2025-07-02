import React from "react";
import SeasonalCarousel from "../components/SeasonalCarousel";
import RecipeDetailSection from "../components/RecipeDetailSection";
import Modal from "../components/Modal";
import { fetchSeasonalRecipes, fetchRecipeDetail, fetchFavoriteRecipes, addFavorite, removeFavorite } from "../services/recipesServices";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';

export default function HomePage() {
  const [seasonalRecipes, setSeasonalRecipes] = React.useState([]);
  const [activeCardId, setActiveCardId] = React.useState(null);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
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
                setError((err.response && err.response.data && err.response.data.error) || err.message || 'Failed to load data');
                setLoading(false);
                return;
              }
              resolve();
            }, async (err) => {
              try {
                recipes = await fetchSeasonalRecipes(-36.8485, 174.7633, 9);
              } catch (err) {
                console.log(err);
                setError((err.response && err.response.data && err.response.data.error) || err.message || 'Failed to load data');
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
            setError((err.response && err.response.data && err.response.data.error) || err.message || 'Failed to load data');
            setLoading(false);
            return;
          }
        }
        setSeasonalRecipes(recipes);
        const favs = await fetchFavoriteRecipes();
        setFavoriteIds(favs.map(r => r.spoonacularId));
      } catch (err) {
        setError((err.response && err.response.data && err.response.data.error) || err.message || "Failed to load data");
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
      setError((err.response && err.response.data && err.response.data.error) || err.message || 'Failed to fetch recipe detail');
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
