using MongoDB.Driver;
using DotNetEnv;

// Generic database service for MongoDB connection and collection access
public class DbService
{
    private readonly IMongoDatabase _database;

    public DbService()
    {
        try
        {
            // Load environment variables
            Env.Load();
            var connectStr = Env.GetString("MONGO_CONNECTION_STRING");
            var dbName = Env.GetString("MONGO_DATABASE");
            
            if (string.IsNullOrEmpty(connectStr))
            {
                throw new InvalidOperationException("MONGO_CONNECTION_STRING is not configured");
            }
            
            if (string.IsNullOrEmpty(dbName))
            {
                throw new InvalidOperationException("MONGO_DATABASE is not configured");
            }
            
            Console.WriteLine($"Connect to MongoDB: {dbName}");
            var client = new MongoClient(connectStr);
            _database = client.GetDatabase(dbName);
            
        }
        catch (Exception ex)
        {
            Console.WriteLine($"MongoDB connection error: {ex.Message}");
            throw;
        }
    }

    // Get a MongoDB collection by type and name
    public IMongoCollection<T> GetCollection<T>(string collectionName)
    {
        return _database.GetCollection<T>(collectionName);
    }
}