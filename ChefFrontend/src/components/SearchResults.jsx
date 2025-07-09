import React from 'react';
import RecipeCard from './RecipeCard';

export default function SearchResults({ 
  searchResults, 
  onRecipeClick, 
  favoriteIds, 
  toggleFavorite,
  searchQuery 
}) {
  if (!searchResults || searchResults.length === 0) {
    return null;
  }

  return (
    <section className="search-results-section">
      <div className="search-results-header">
        <h2>
          Search Results for "{searchQuery}" ({searchResults.length} recipes)
        </h2>
      </div>
      <div className="search-results-grid">
        {searchResults.map((recipe) => (
          <RecipeCard
            key={recipe.spoonacularId}
            recipe={recipe}
            onClick={onRecipeClick}
            isFavorite={favoriteIds && favoriteIds.includes(recipe.spoonacularId)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </section>
  );
} 