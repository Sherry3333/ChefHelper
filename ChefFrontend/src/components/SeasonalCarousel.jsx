import React from 'react';
import Slider from 'react-slick';
import RecipeCard from './RecipeCard';
import { useFavorites } from '../context/FavoriteContext';

export default function SeasonalCarousel({ recipes, activeCardId, setActiveCardId, handleRecipeClick, sliderSettings, toggleFavorite, onVoteUpdate }) {
  const { isFavorite } = useFavorites();

  if (!recipes || recipes.length === 0) return null;
  return (
    <div className="seasonal-carousel">
      <Slider {...sliderSettings}>
        {recipes.map(recipe => (
          <div key={recipe.spoonacularId || recipe.id} className="seasonal-carousel-slide">
            <RecipeCard
              recipe={recipe}
              onClick={id => {
                setActiveCardId && setActiveCardId(id);
                handleRecipeClick && handleRecipeClick(id);
              }}
              isFavorite={isFavorite(recipe)}
              onToggleFavorite={toggleFavorite}
              onVoteUpdate={onVoteUpdate}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}
