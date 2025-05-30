using ChefBackend.Models;
using DotNetEnv;
using MongoDB.Driver;

namespace ChefBackend.Services;

public class DbService{
    private readonly IMongoCollection<Recipe> _recipeCollection;

    public DbService()
    {
        Env.Load();
        var settings = new MongoDbSettings
        {
            ConnectStr = Env.GetString("MONGO_CONNECTION_STRING"),
            DatabaseName = Env.GetString("MONGO_DATABASE"),
            CollectionName = Env.GetString("MONGO_COLLECTION")
        };

        var client = new MongoClient(settings.ConnectStr);
        var database = client.GetDatabase(settings.DatabaseName);
        _recipeCollection = database.GetCollection<Recipe>(settings.CollectionName);
    }

    // add
    public async Task CreateAsync(Recipe recipe) => await _recipeCollection.InsertOneAsync(recipe);

    // get
    public async Task<List<Recipe>> GetAsync() => await _recipeCollection.Find(_ => true).ToListAsync();

    // getById  The method may return a Recipe object or null
    public async Task<Recipe?> GetByIdAsync(string id) => 
        await _recipeCollection.Find(u => u.Id == id).FirstOrDefaultAsync();

    // updete
    public async Task UpdateAsync(string id, Recipe recipe) =>
        await _recipeCollection.ReplaceOneAsync(u => u.Id == id, recipe);

    // delete
    public async Task DeleteAsync(string id) =>
        await _recipeCollection.DeleteOneAsync(u => u.Id == id);
}