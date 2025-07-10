import React from 'react';
import RecipeCard from './RecipeCard';
import { useFavorites } from '../context/FavoriteContext';

export default function SearchResults({ 
  searchResults, 
  onRecipeClick, 
  toggleFavorite,
  searchQuery,
  onVoteUpdate
}) {
  const { isFavorite } = useFavorites();

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
            key={recipe.spoonacularId || recipe.id}
            recipe={recipe}
            onClick={onRecipeClick}
            isFavorite={isFavorite(recipe)}
            onToggleFavorite={toggleFavorite}
            onVoteUpdate={onVoteUpdate}
          />
        ))}
      </div>
    </section>
  );
} 