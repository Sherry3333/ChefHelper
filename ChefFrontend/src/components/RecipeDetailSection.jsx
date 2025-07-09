import React from "react";

export default function RecipeDetailSection({ detail, onClose, onToggleFavorite, isFavorite }) {
  if (!detail) return null;
  // compatible with extendedIngredients (object array) and ingredients (string array)
  const ingredients = detail.extendedIngredients || detail.ingredients || [];
  return (
    <section className="recipe-detail-section">
      {onClose && (
        <button
          onClick={onClose}
          className="detail-close-btn"
          aria-label="Close details"
        >
          ×
        </button>
      )}
      <div className="detail-title-row">
        <h2 className="detail-title">{detail.title}</h2>
        {onToggleFavorite && (
          <span
            className="heart-icon"
            onClick={onToggleFavorite}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onToggleFavorite(); }}
            aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            style={{ color: isFavorite ? 'red' : '#aaa' }}
          >
            {isFavorite ? '❤️' : '🤍'}
          </span>
        )}
      </div>
      <img src={detail.image} alt={detail.title} className="detail-image" />
      <div>
        <h3>Ingredients:</h3>
        <ul>
          {ingredients.map((ing, idx) =>
            typeof ing === 'string'
              ? <li key={idx}>{ing}</li>
              : <li key={ing.id || idx}>{ing.original || ing.name || JSON.stringify(ing)}</li>
          )}
        </ul>
        <h3>Instructions:</h3>
        <div className="detail-instructions" dangerouslySetInnerHTML={{__html: detail.instructions}} />
      </div>
    </section>
  );
}
