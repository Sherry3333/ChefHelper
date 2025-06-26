using MongoDB.Driver;
using ChefBackend.Models;
using System.Text.Json;

// Initializer for importing seasonal ingredients from JSON if collection is empty
public class SeasonalIngredientInitializer
{
    private readonly IMongoCollection<SeasonalIngredient> _ingredientCollection;
    private readonly ILogger<SeasonalIngredientInitializer> _logger;

    public SeasonalIngredientInitializer(DbService dbService, ILogger<SeasonalIngredientInitializer> logger)
    {
        _ingredientCollection = dbService.GetCollection<SeasonalIngredient>("Ingredients");
        _logger = logger;
    }

    // Initialize the collection from a JSON file if empty
    public async Task InitializeAsync(string jsonFilePath)
    {
        // Ensure unique index on (ingredient, region, season)
        var indexKeys = Builders<SeasonalIngredient>.IndexKeys
            .Ascending(i => i.Ingredient)
            .Ascending(i => i.Region)
            .Ascending(i => i.Season);
        var indexModel = new CreateIndexModel<SeasonalIngredient>(indexKeys, new CreateIndexOptions { Unique = true });
        await _ingredientCollection.Indexes.CreateOneAsync(indexModel);

        var count = await _ingredientCollection.CountDocumentsAsync(FilterDefinition<SeasonalIngredient>.Empty);
        if (count > 0)
        {
            _logger.LogInformation("Seasonal ingredients already initialized.");
            return;
        }

        var json = await File.ReadAllTextAsync(jsonFilePath);
        var ingredients = JsonSerializer.Deserialize<List<SeasonalIngredient>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (ingredients != null && ingredients.Count > 0)
        {
            await _ingredientCollection.InsertManyAsync(ingredients);
            _logger.LogInformation($"Inserted {ingredients.Count} seasonal ingredients.");
        }
        else
        {
            _logger.LogWarning("No seasonal ingredients found in the JSON file.");
        }
    }
} 