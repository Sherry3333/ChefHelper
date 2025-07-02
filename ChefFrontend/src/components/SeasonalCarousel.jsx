import Slider from "react-slick";

export default function SeasonalCarousel({ recipes, activeCardId, setActiveCardId, handleRecipeClick, sliderSettings, favoriteIds = [], toggleFavorite = () => {} }) {
  return (
    <section className="seasonal-carousel-section">
      <Slider {...sliderSettings}>
        {recipes.map(r => {
          const isFavorite = favoriteIds.includes(r.spoonacularId);
          return (
            <div
              key={r.spoonacularId}
              className={`recipe-card${activeCardId === r.spoonacularId ? " active" : ""}`}
              onClick={() => {
                setActiveCardId(r.spoonacularId);
                handleRecipeClick(r.spoonacularId);
              }}
            >
              <div className="image-wrapper">
                {r.image && (
                  <img
                    src={r.image}
                    alt={r.title}
                    className="recipe-card-image"
                    style={{ cursor: "pointer" }}
                  />
                )}
              </div>
              <div className="card-footer">
                <span className="title">{r.title}</span>
                <span
                  className="heart-icon"
                  style={{ color: isFavorite ? 'red' : '#ccc', cursor: 'pointer' }}
                  onClick={e => {
                    e.stopPropagation();
                    toggleFavorite(r.spoonacularId);
                  }}
                  title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                >
                  {isFavorite ? "❤️" : "🤍"}
                </span>
              </div>
            </div>
          );
        })}
      </Slider>
    </section>
  );
}
