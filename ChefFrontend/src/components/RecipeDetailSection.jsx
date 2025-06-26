export default function RecipeDetailSection({ detail }) {
  if (!detail) return null;
  return (
    <section className="recipe-detail-section">
      <h2>{detail.title}</h2>
      <img src={detail.image} alt={detail.title} style={{width: 240, borderRadius: 12}} />
      <div>
        <h3>Ingredients:</h3>
        <ul>
          {detail.extendedIngredients?.map(ing => (
            <li key={ing.id}>{ing.original}</li>
          ))}
        </ul>
        <h3>Instructions:</h3>
        <div dangerouslySetInnerHTML={{__html: detail.instructions}} />
      </div>
    </section>
  );
}
