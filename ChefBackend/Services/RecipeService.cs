using MongoDB.Driver;
using ChefBackend.Models;
using ChefBackend.Services;

// Service for Recipe CRUD operations
public class RecipeService
{
    private readonly IMongoCollection<Recipe> _recipeCollection;

    public RecipeService(DbService dbService)
    {
        _recipeCollection = dbService.GetCollection<Recipe>("Recipes");
    }

    // Create a new recipe
    public async Task CreateAsync(Recipe recipe) => await _recipeCollection.InsertOneAsync(recipe);

    // Get all recipes
    public async Task<List<Recipe>> GetAsync() => await _recipeCollection.Find(_ => true).ToListAsync();

    // Get a recipe by ID
    public async Task<Recipe?> GetByIdAsync(string id) =>
        await _recipeCollection.Find(u => u.Id == id).FirstOrDefaultAsync();

    // Update a recipe by ID
    public async Task UpdateAsync(string id, Recipe recipe) =>
        await _recipeCollection.ReplaceOneAsync(u => u.Id == id, recipe);

    // Delete a recipe by ID
    public async Task DeleteAsync(string id) =>
        await _recipeCollection.DeleteOneAsync(u => u.Id == id);

    public async Task<List<Recipe>> GetByIdsAsync(List<string> ids)
    {
        var filter = Builders<Recipe>.Filter.In(r => r.Id, ids);
        return await _recipeCollection.Find(filter).ToListAsync();
    }

    // Get a recipe by SpoonacularId
    public async Task<Recipe?> GetBySpoonacularIdAsync(int spoonacularId)
    {
        return await _recipeCollection.Find(r => r.SpoonacularId == spoonacularId).FirstOrDefaultAsync();
    }

    // Create a recipe from SpoonacularRecipeDetail
    public async Task<Recipe> CreateFromSpoonacularAsync(SpoonacularRecipeDetail detail)
    {
        var recipe = new Recipe
        {
            SpoonacularId = detail.Id,
            Title = detail.Title,
            Image = detail.Image,
            Summary = "", // You can extend to fetch summary if needed
            Instructions = detail.Instructions,
            Ingredients = detail.ExtendedIngredients?.ConvertAll(ing => ing.Original) ?? new List<string>(),
            ReadyInMinutes = 0, // You can extend to fetch this if needed
            CreatedAt = DateTime.UtcNow
        };
        await _recipeCollection.InsertOneAsync(recipe);
        return recipe;
    }
} 