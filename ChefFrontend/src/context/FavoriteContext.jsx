import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchFavoriteRecipes, buildFavoriteKey, normalizeRecipeFields } from '../services/recipesServices';

const FavoriteContext = createContext();

export function FavoriteProvider({ children }) {
  const [favoriteMap, setFavoriteMap] = useState({});
  const [loading, setLoading] = useState(false);
  const { isLoggedIn } = useAuth();

  // Load favorites when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      loadFavorites();
    } else {
      setFavoriteMap({});
    }
  }, [isLoggedIn]);

  const loadFavorites = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const favorites = await fetchFavoriteRecipes();
      const map = {};
      favorites.forEach(recipe => {
        const normalizedRecipe = normalizeRecipeFields(recipe);
        if (normalizedRecipe.id) {
          map[`local-${normalizedRecipe.id}`] = true;
        }
        if (normalizedRecipe.spoonacularId) {
          map[`spoon-${normalizedRecipe.spoonacularId}`] = true;
        }
      });
      setFavoriteMap(map);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFavoriteState = (recipe, isFavorite) => {
    const normalizedRecipe = normalizeRecipeFields(recipe);
    const key = buildFavoriteKey(normalizedRecipe);
    console.log('FavoriteContext: updateFavoriteState called:', { recipe: normalizedRecipe, key, isFavorite });
    setFavoriteMap(prev => ({
      ...prev,
      [key]: isFavorite
    }));
  };

  const isFavorite = (recipe) => {
    const normalizedRecipe = normalizeRecipeFields(recipe);
    const key = buildFavoriteKey(normalizedRecipe);
    const result = favoriteMap[key] || false;
    console.log('FavoriteContext: isFavorite called:', { recipe: normalizedRecipe, key, result, favoriteMap });
    return result;
  };

  const refreshFavorites = () => {
    if (isLoggedIn) {
      loadFavorites();
    }
  };

  return (
    <FavoriteContext.Provider value={{
      favoriteMap,
      loading,
      isFavorite,
      updateFavoriteState,
      refreshFavorites
    }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
} 