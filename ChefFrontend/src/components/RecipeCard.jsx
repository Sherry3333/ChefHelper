import React from 'react';
import chefIcon from '../assets/chef_icon.png';
import { addVote, removeVote } from '../services/recipesServices';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function RecipeCard({ recipe, onClick, onToggleFavorite, isFavorite }) {
  const [likes, setLikes] = React.useState(recipe.likes || 0);
  const [voted, setVoted] = React.useState(!!recipe.voted);
  const [voteLoading, setVoteLoading] = React.useState(false);
  const { isLoggedIn } = useAuth();

  React.useEffect(() => {
    setLikes(recipe.likes || 0);
    setVoted(!!recipe.voted);
  }, [recipe.likes, recipe.voted, recipe.spoonacularId]);

  const handleVote = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.info("Please login to like recipes.");
      return;
    }
    if (voteLoading) return;
    setVoteLoading(true);
    try {
      if (voted) {
        await removeVote(recipe.spoonacularId);
        setLikes(likes - 1);
        setVoted(false);
      } else {
        await addVote(recipe.spoonacularId);
        setLikes(likes + 1);
        setVoted(true);
      }
    } catch (err) {
      // Optionally show error toast
    } finally {
      setVoteLoading(false);
    }
  };

  return (
    <div
      className="recipe-card"
      onClick={() => onClick && onClick(recipe.spoonacularId)}
      tabIndex={0}
      role="button"
      aria-label={recipe.title}
    >
      <div className="recipe-card-image-wrapper">
        <img
          className="recipe-card-image"
          src={recipe.image || chefIcon}
          alt={recipe.title}
          onError={e => {
            if (e.target.src !== chefIcon) {
              e.target.onerror = null;
              e.target.src = chefIcon;
            }
          }}
        />
        {onToggleFavorite && (
          <button
            className={`recipe-card-favorite-btn${isFavorite ? ' favorited' : ''}`}
            onClick={e => {
              e.stopPropagation();
              onToggleFavorite(recipe.spoonacularId);
            }}
            aria-label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            tabIndex={0}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
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