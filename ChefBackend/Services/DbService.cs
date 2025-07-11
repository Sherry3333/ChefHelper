using MongoDB.Driver;
using ChefBackend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using DotNetEnv;

namespace ChefBackend.Services
{
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

        public IMongoCollection<T> GetCollection<T>(string collectionName)
        {
            return _database.GetCollection<T>(collectionName);
        }

        // Create all necessary indexes for the application
        public async Task CreateIndexesAsync()
        {
            try
            {
                // Create Vote collection indexes
                var voteCollection = GetCollection<Vote>("Votes");
                
                // Check if unique compound index exists
                var existingVoteIndexes = await voteCollection.Indexes.ListAsync();
                var voteIndexList = await existingVoteIndexes.ToListAsync();
                var hasVoteUniqueIndex = voteIndexList.Any(idx => idx["name"].AsString == "unique_user_recipe_vote");
                
                if (!hasVoteUniqueIndex)
                {
                    // Unique compound index for preventing duplicate votes
                    var voteUniqueIndex = Builders<Vote>.IndexKeys.Ascending(v => v.UserId).Ascending(v => v.RecipeId);
                    var voteUniqueIndexOptions = new CreateIndexOptions { Unique = true, Name = "unique_user_recipe_vote" };
                    await voteCollection.Indexes.CreateOneAsync(new CreateIndexModel<Vote>(voteUniqueIndex, voteUniqueIndexOptions));
                    Console.WriteLine("✅ Created unique_user_recipe_vote index");
                }

                // Check and create vote count index
                var hasVoteCountIndex = voteIndexList.Any(idx => idx["name"].AsString == "recipe_vote_count");
                if (!hasVoteCountIndex)
                {
                    var voteCountIndex = Builders<Vote>.IndexKeys.Ascending(v => v.RecipeId);
                    var voteCountIndexOptions = new CreateIndexOptions { Name = "recipe_vote_count" };
                    await voteCollection.Indexes.CreateOneAsync(new CreateIndexModel<Vote>(voteCountIndex, voteCountIndexOptions));
                    Console.WriteLine("✅ Created recipe_vote_count index");
                }

                // Check and create user vote index
                var hasUserVoteIndex = voteIndexList.Any(idx => idx["name"].AsString == "user_votes");
                if (!hasUserVoteIndex)
                {
                    var userVoteIndex = Builders<Vote>.IndexKeys.Ascending(v => v.UserId);
                    var userVoteIndexOptions = new CreateIndexOptions { Name = "user_votes" };
                    await voteCollection.Indexes.CreateOneAsync(new CreateIndexModel<Vote>(userVoteIndex, userVoteIndexOptions));
                    Console.WriteLine("✅ Created user_votes index");
                }

                // Create Recipe collection indexes
                var recipeCollection = GetCollection<Recipe>("Recipes");
                var existingRecipeIndexes = await recipeCollection.Indexes.ListAsync();
                var recipeIndexList = await existingRecipeIndexes.ToListAsync();
                
                // Check and create SpoonacularId index
                var hasSpoonacularIndex = recipeIndexList.Any(idx => idx["name"].AsString == "spoonacular_id_lookup");
                if (!hasSpoonacularIndex)
                {
                    var spoonacularIndex = Builders<Recipe>.IndexKeys.Ascending(r => r.SpoonacularId);
                    var spoonacularIndexOptions = new CreateIndexOptions { Name = "spoonacular_id_lookup" };
                    await recipeCollection.Indexes.CreateOneAsync(new CreateIndexModel<Recipe>(spoonacularIndex, spoonacularIndexOptions));
                    Console.WriteLine("✅ Created spoonacular_id_lookup index");
                }

                // Check and create creator index
                var hasCreatorIndex = recipeIndexList.Any(idx => idx["name"].AsString == "recipe_creator");
                if (!hasCreatorIndex)
                {
                    var creatorIndex = Builders<Recipe>.IndexKeys.Ascending(r => r.CreatedBy);
                    var creatorIndexOptions = new CreateIndexOptions { Name = "recipe_creator" };
                    await recipeCollection.Indexes.CreateOneAsync(new CreateIndexModel<Recipe>(creatorIndex, creatorIndexOptions));
                    Console.WriteLine("✅ Created recipe_creator index");
                }

                // Create User collection indexes
                var userCollection = GetCollection<User>("Users");
                var existingUserIndexes = await userCollection.Indexes.ListAsync();
                var userIndexList = await existingUserIndexes.ToListAsync();
                
                // Check and create email index
                var hasEmailIndex = userIndexList.Any(idx => idx["name"].AsString == "unique_user_email");
                if (!hasEmailIndex)
                {
                    var emailIndex = Builders<User>.IndexKeys.Ascending(u => u.Email);
                    var emailIndexOptions = new CreateIndexOptions { Unique = true, Name = "unique_user_email" };
                    await userCollection.Indexes.CreateOneAsync(new CreateIndexModel<User>(emailIndex, emailIndexOptions));
                    Console.WriteLine("✅ Created unique_user_email index");
                }

                // Create Favorite collection indexes
                var favoriteCollection = GetCollection<Favorite>("Favorites");
                var existingFavoriteIndexes = await favoriteCollection.Indexes.ListAsync();
                var favoriteIndexList = await existingFavoriteIndexes.ToListAsync();
                
                // Check and create favorite unique index
                var hasFavoriteUniqueIndex = favoriteIndexList.Any(idx => idx["name"].AsString == "unique_user_recipe_favorite");
                if (!hasFavoriteUniqueIndex)
                {
                    var favoriteUniqueIndex = Builders<Favorite>.IndexKeys.Ascending(f => f.UserId).Ascending(f => f.RecipeId);
                    var favoriteUniqueIndexOptions = new CreateIndexOptions { Unique = true, Name = "unique_user_recipe_favorite" };
                    await favoriteCollection.Indexes.CreateOneAsync(new CreateIndexModel<Favorite>(favoriteUniqueIndex, favoriteUniqueIndexOptions));
                    Console.WriteLine("✅ Created unique_user_recipe_favorite index");
                }

                Console.WriteLine("✅ Database index check completed successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error creating database indexes: {ex.Message}");
                // Don't throw exception as indexes might already exist
            }
        }
    }
}