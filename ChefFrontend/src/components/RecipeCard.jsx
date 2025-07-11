import React from 'react';
import chefIcon from '../assets/chef_icon.png';
import { addVote, removeVote } from '../services/recipesServices';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoriteContext';
import { toast } from 'react-toastify';

export default function RecipeCard({ recipe, onClick, onToggleFavorite, isFavorite, onEdit, onDelete, onVoteUpdate }) {
  const [voteLoading, setVoteLoading] = React.useState(false);
  const { isLoggedIn } = useAuth();

  // Use recipe.voted and recipe.likes directly from API response
  const voted = recipe.voted || false;
  const likes = recipe.likes || 0;

  const handleVote = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.info("Please login to like recipes.");
      return;
    }
    if (voteLoading) return;
    
    console.log('RecipeCard: handleVote called', { 
      recipe: { id: recipe.id, spoonacularId: recipe.spoonacularId },
      currentVoted: voted,
      currentLikes: likes 
    });
    
    setVoteLoading(true);
    try {
      if (voted) {
        console.log('RecipeCard: Removing vote');
        await removeVote(recipe);
      } else {
        console.log('RecipeCard: Adding vote');
        await addVote(recipe);
      }
      console.log('RecipeCard: Vote operation successful');
      // Notify parent component to refresh recipe data
      if (onVoteUpdate) {
        onVoteUpdate();
      }
    } catch (err) {
      console.error('RecipeCard: Vote error:', err);
      if (err.response && err.response.status === 409) {
        toast.error('You have already voted for this recipe');
      } else {
        toast.error('Failed to update vote');
      }
    } finally {
      setVoteLoading(false);
    }
  };

  return (
    <div
      className="recipe-card"
      onClick={() => onClick && onClick(recipe.id || recipe.spoonacularId)}
      tabIndex={0}
      role="button"
      aria-label={recipe.title}
    >
      <div className="recipe-card-image-wrapper">
        <img
          className={`recipe-card-image${recipe.image ? '' : ' default-chef-image'}`}
          src={recipe.image || chefIcon}
          alt={recipe.title}
          onError={e => {
            if (e.target.src !== chefIcon) {
              e.target.onerror = null;
              e.target.src = chefIcon;
              e.target.className = 'recipe-card-image default-chef-image'; // dynamically add class
            }
          }}
        />
        {onToggleFavorite && (
          <button
            className={`recipe-card-favorite-btn${isFavorite ? ' favorited' : ''}`}
            onClick={e => {
              e.stopPropagation();
              onToggleFavorite(recipe);
            }}
            aria-label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            tabIndex={0}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        )}
        {(onEdit || onDelete) && (
          <div className="recipe-card-actions">
            {onEdit && (
              <button
                className="recipe-card-edit-btn"
                onClick={e => { e.stopPropagation(); onEdit(recipe); }}
                aria-label="Edit Recipe"
                tabIndex={0}
              >✏️</button>
            )}
            {onDelete && (
              <button
                className="recipe-card-delete-btn"
                onClick={e => { e.stopPropagation(); onDelete(recipe); }}
                aria-label="Delete Recipe"
                tabIndex={0}
              >🗑️</button>
            )}
          </div>
        )}
      </div>
      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <div className="recipe-card-meta">
          <button
            className={`recipe-card-like-btn${voted ? ' liked' : ''}`}
            onClick={handleVote}
            disabled={voteLoading}
            aria-label={voted ? 'Unlike' : 'Like'}
            tabIndex={0}
            type="button"
          >
            {voteLoading ? '...' : '👍'}
          </button>
          <span className="recipe-card-likes">{likes}</span>
        </div>
      </div>
    </div>
  );
} 