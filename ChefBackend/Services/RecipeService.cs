using MongoDB.Driver;
using ChefBackend.Models;

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
} 