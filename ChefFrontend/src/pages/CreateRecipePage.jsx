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
  const [originalRecipe, setOriginalRecipe] = useState(null); // 新增
  const navigate = useNavigate();
  const { id } = useParams();

  // 编辑模式下拉取详情
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchMyRecipeDetail(id)
      .then(data => {
        setOriginalRecipe(data); // 保存原始数据
        setTitle(data.title || '');
        setIngredients(data.ingredients && data.ingredients.length > 0 ? data.ingredients : ['']);
        setInstructions(data.instructions || '');
        // image 先不处理
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
        // merge original recipe with new data
        result = await updateRecipe(id, {
          ...(originalRecipe || {}),
          id,
          title,
          ingredients,
          instructions,
          image: ''
        });
      } else {
        result = await saveRecipe(title, ingredients, instructions);
      }
      if (result !== null && result !== undefined) {
        navigate('/my-recipes');
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
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        {error && <div className="form-error">{error}</div>}
        <button type="submit" className="submit-recipe-btn" disabled={loading}>{loading ? 'Saving...' : (id ? 'Update' : 'Submit')}</button>
      </form>
    </div>
  );
};

export default CreateRecipePage; 