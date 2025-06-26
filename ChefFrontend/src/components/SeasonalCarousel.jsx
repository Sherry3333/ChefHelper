import Slider from "react-slick";

export default function SeasonalCarousel({ recipes, activeCardId, setActiveCardId, handleRecipeClick, sliderSettings }) {
  return (
    <section className="seasonal-carousel-section">
      <Slider {...sliderSettings}>
        {recipes.map(r => (
          <div
            key={r.id}
            className={`seasonal-recipe-card${activeCardId === r.id ? " active" : ""}`}
            onClick={() => {
              setActiveCardId(r.id);
              handleRecipeClick(r.id);
            }}
          >
            {r.image && (
              <img
                src={r.image}
                alt={r.title}
                className="seasonal-recipe-img"
                style={{ cursor: "pointer" }}
              />
            )}
            <h3 className="seasonal-recipe-title">{r.title}</h3>
          </div>
        ))}
      </Slider>
    </section>
  );
}
