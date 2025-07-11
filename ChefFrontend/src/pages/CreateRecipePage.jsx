import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveRecipe, updateRecipe, fetchMyRecipeDetail } from '../services/recipesServices';

const CreateRecipePage = () => {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [originalRecipe, setOriginalRecipe] = useState(null); // new
  const navigate = useNavigate();
  const { id } = useParams();

  // edit mode fetch detail
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchMyRecipeDetail(id)
      .then(data => {
        setOriginalRecipe(data); // save original data
        setTitle(data.title || '');
        setIngredients(data.ingredients && data.ingredients.length > 0 ? data.ingredients : ['']);
        setInstructions(data.instructions || '');
        setImage(data.image || null); // initialize image state to original image URL
      })
      .catch(() => setError('Failed to load recipe details'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleIngredientChange = (idx, value) => {
    const newIngredients = [...ingredients];
    newIngredients[idx] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => setIngredients([...ingredients, '']);
  const removeIngredient = idx => setIngredients(ingredients.filter((_, i) => i !== idx));

  const handleImageChange = e => setImage(e.target.files[0]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title || ingredients.some(i => !i) || !instructions) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      let result;
      if (id) {
        // Only send image if it's a File (i.e., user selected a new image)
        let imageFile = null;
        if (image instanceof File) {
          imageFile = image;
        }
        result = await updateRecipe(id, {
          title,
          ingredients,
          instructions,
          image: imageFile // Only send File, not URL string
        });
      } else {
        result = await saveRecipe(title, ingredients, instructions, image instanceof File ? image : null);
      }
      if (result !== null && result !== undefined) {
        navigate('/my-recipes?tab=created');
      } else {
        setError('Failed to save recipe, please try again');
      }
    } catch (err) {
      setError('Failed to save recipe, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-recipe-container">
      <h2 className="create-recipe-title">{id ? 'Edit Recipe' : 'Create Recipe'}</h2>
      <form className="create-recipe-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Recipe Name</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required className="form-input" />
        </div>
        <div className="form-group">
          <label>Ingredients List</label>
          {ingredients.map((ing, idx) => (
            <div key={idx} className="ingredient-row">
              <input value={ing} onChange={e => handleIngredientChange(idx, e.target.value)} required className="form-input" />
              {ingredients.length > 1 && <button type="button" className="remove-ingredient-btn" onClick={() => removeIngredient(idx)}>Remove</button>}
            </div>
          ))}
          <button type="button" className="add-ingredient-btn" onClick={addIngredient}>+ Add Ingredient</button>
        </div>
        <div className="form-group">
          <label>Steps</label>
          <textarea value={instructions} onChange={e => setInstructions(e.target.value)} required rows={4} className="form-input" />
        </div>
        <div className="form-group">
          <label>Recipe Image</label>
          {/* image preview */}
          {image && !(image instanceof File) && (
            <div style={{ marginBottom: 8 }}>
              <img src={image} alt="Current" style={{ maxWidth: 180, borderRadius: 8 }} />
            </div>
          )}
          {image instanceof File && (
            <div style={{ marginBottom: 8 }}>
              <img src={URL.createObjectURL(image)} alt="Preview" style={{ maxWidth: 180, borderRadius: 8 }} />
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        {error && <div className="form-error">{error}</div>}
        <button type="submit" className="submit-recipe-btn" disabled={loading}>{loading ? 'Saving...' : (id ? 'Update' : 'Submit')}</button>
      </form>
    </div>
  );
};

export default CreateRecipePage; 