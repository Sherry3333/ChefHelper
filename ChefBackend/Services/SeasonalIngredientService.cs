using MongoDB.Driver;
using ChefBackend.Models;
using ChefBackend.Services;

// Service for SeasonalIngredient CRUD operations
public class SeasonalIngredientService
{
    private readonly IMongoCollection<SeasonalIngredient> _ingredientCollection;

    public SeasonalIngredientService(DbService dbService)
    {
        _ingredientCollection = dbService.GetCollection<SeasonalIngredient>("Ingredients");
    }

    // Create a new seasonal ingredient
    public async Task CreateAsync(SeasonalIngredient ingredient) => await _ingredientCollection.InsertOneAsync(ingredient);

    // Get all seasonal ingredients
    public async Task<List<SeasonalIngredient>> GetAsync() => await _ingredientCollection.Find(_ => true).ToListAsync();

    // Get ingredients by season and region
    public async Task<List<SeasonalIngredient>> GetBySeasonAndRegionAsync(string season, string region) =>
        await _ingredientCollection.Find(i => i.Season == season && i.Region == region).ToListAsync();

    // Update an ingredient by ID
    public async Task UpdateAsync(string id, SeasonalIngredient ingredient) =>
        await _ingredientCollection.ReplaceOneAsync(i => i.Id == id, ingredient);

    // Delete an ingredient by ID
    public async Task DeleteAsync(string id) =>
        await _ingredientCollection.DeleteOneAsync(i => i.Id == id);
} 