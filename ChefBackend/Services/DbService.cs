using MongoDB.Driver;
using DotNetEnv;

// Generic database service for MongoDB connection and collection access
public class DbService
{
    private readonly IMongoDatabase _database;

    public DbService()
    {
        // Load environment variables
        Env.Load();
        var connectStr = Env.GetString("MONGO_CONNECTION_STRING");
        var dbName = Env.GetString("MONGO_DATABASE");
        var client = new MongoClient(connectStr);
        _database = client.GetDatabase(dbName);
    }

    // Get a MongoDB collection by type and name
    public IMongoCollection<T> GetCollection<T>(string collectionName)
    {
        return _database.GetCollection<T>(collectionName);
    }
}