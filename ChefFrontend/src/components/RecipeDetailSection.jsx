import React from "react";

export default function RecipeDetailSection({ detail, onClose, onToggleFavorite, isFavorite }) {
  if (!detail) return null;
  // compatible with extendedIngredients (object array) and ingredients (string array)
  const ingredients = detail.extendedIngredients || detail.ingredients || [];
  return (
    <section className="recipe-detail-section" style={{ position: 'relative', background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.12)', maxWidth: 600, margin: '32px auto' }}>
      {onClose && (
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer' }}
          aria-label="Close details"
        >
          ×
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 style={{ margin: 0 }}>{detail.title}</h2>
        {onToggleFavorite && (
          <span
            className="heart-icon"
            style={{ color: isFavorite ? 'red' : '#aaa', fontSize: 28, cursor: 'pointer', marginLeft: 8 }}
            onClick={onToggleFavorite}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onToggleFavorite(); }}
            aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            {isFavorite ? '❤️' : '🤍'}
          </span>
        )}
      </div>
      <img src={detail.image} alt={detail.title} style={{width: 240, borderRadius: 12}} />
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
        <div dangerouslySetInnerHTML={{__html: detail.instructions}} />
      </div>
    </section>
  );
}
