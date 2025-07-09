import React from 'react';
import Slider from 'react-slick';
import RecipeCard from './RecipeCard';

export default function SeasonalCarousel({ recipes, activeCardId, setActiveCardId, handleRecipeClick, sliderSettings, favoriteIds, toggleFavorite }) {
  if (!recipes || recipes.length === 0) return null;
  return (
    <div className="seasonal-carousel">
      <Slider {...sliderSettings}>
        {recipes.map(recipe => (
          <div key={recipe.spoonacularId} className="seasonal-carousel-slide">
            <RecipeCard
              recipe={recipe}
              onClick={id => {
                setActiveCardId && setActiveCardId(id);
                handleRecipeClick && handleRecipeClick(id);
              }}
              isFavorite={favoriteIds && favoriteIds.includes(recipe.spoonacularId)}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}
