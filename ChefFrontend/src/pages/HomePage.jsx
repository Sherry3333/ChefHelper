import React from "react";
import SeasonalCarousel from "../components/SeasonalCarousel";
import RecipeDetailSection from "../components/RecipeDetailSection";
import { fetchSeasonalRecipes, fetchRecipeDetail } from "../services/recipesServices";

export default function HomePage() {
  const [seasonalRecipes, setSeasonalRecipes] = React.useState([]);
  const [activeCardId, setActiveCardId] = React.useState(null);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function fetchRecipesWithGeo() {
      setLoading(true);
      setError(null);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords;
          const recipes = await fetchSeasonalRecipes(latitude, longitude, 9);
          setSeasonalRecipes(recipes);
          setLoading(false);
        }, async (err) => {
          const recipes = await fetchSeasonalRecipes(-36.8485, 174.7633, 9);
          setSeasonalRecipes(recipes);
          setLoading(false);
        });
      } else {
        fetchSeasonalRecipes(-36.8485, 174.7633, 9).then(recipes => {
          setSeasonalRecipes(recipes);
          setLoading(false);
        });
      }
    }
    fetchRecipesWithGeo();
  }, []);

  async function handleRecipeClick(id) {
    setActiveCardId(id);
    const detail = await fetchRecipeDetail(id);
    setSelectedRecipeDetail(detail);
  }

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
        {error && <p style={{color: 'red'}}>Error: {error}</p>}
        <SeasonalCarousel
          recipes={seasonalRecipes}
          activeCardId={activeCardId}
          setActiveCardId={setActiveCardId}
          handleRecipeClick={handleRecipeClick}
          sliderSettings={settings}
        />
      </section>
      <RecipeDetailSection detail={selectedRecipeDetail} />
    </main>
  );
}
