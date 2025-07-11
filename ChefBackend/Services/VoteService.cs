using MongoDB.Driver;
using ChefBackend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace ChefBackend.Services
{
    public class VoteService
    {
        private readonly IMongoCollection<Vote> _voteCollection;
        private readonly RecipeService _recipeService;

        public VoteService(DbService dbService, RecipeService recipeService)
        {
            _voteCollection = dbService.GetCollection<Vote>("Votes");
            _recipeService = recipeService;
        }

        // Add a vote for a recipe by a user
        public async Task<bool> AddVoteAsync(string userId, string recipeId)
        {
            try
            {
                // Check if vote already exists
                var exists = await _voteCollection.Find(v => v.UserId == userId && v.RecipeId == recipeId).AnyAsync();
                if (exists) return false;
                
                // Insert new vote
                await _voteCollection.InsertOneAsync(new Vote { UserId = userId, RecipeId = recipeId });
                return true;
            }
            catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
            {
                // Handle duplicate key error (in case of race condition)
                return false;
            }
        }

        // Remove a vote for a recipe by a user
        public async Task<bool> RemoveVoteAsync(string userId, string recipeId)
        {
            var result = await _voteCollection.DeleteOneAsync(v => v.UserId == userId && v.RecipeId == recipeId);
            return result.DeletedCount > 0;
        }

        // Get the total vote count for a recipe
        public async Task<int> GetVoteCountAsync(string recipeId)
        {
            return (int)await _voteCollection.CountDocumentsAsync(v => v.RecipeId == recipeId);
        }

        // Check if a user has voted for a recipe
        public async Task<bool> HasUserVotedAsync(string userId, string recipeId)
        {
            return await _voteCollection.Find(v => v.UserId == userId && v.RecipeId == recipeId).AnyAsync();
        }

        // Batch: Get vote counts for a list of recipeIds
        public async Task<Dictionary<string, int>> GetVoteCountsAsync(List<string> recipeIds)
        {
            if (recipeIds == null || !recipeIds.Any())
                return new Dictionary<string, int>();

            var filter = Builders<Vote>.Filter.In(v => v.RecipeId, recipeIds);
            var votes = await _voteCollection.Find(filter).ToListAsync();
            return votes.GroupBy(v => v.RecipeId)
                        .ToDictionary(g => g.Key, g => g.Count());
        }

        // Batch: Get recipeIds that the user has voted for from a list
        public async Task<List<string>> GetUserVotedRecipeIdsAsync(string userId, List<string> recipeIds)
        {
            if (string.IsNullOrEmpty(userId) || recipeIds == null || !recipeIds.Any())
                return new List<string>();

            var filter = Builders<Vote>.Filter.And(
                Builders<Vote>.Filter.Eq(v => v.UserId, userId),
                Builders<Vote>.Filter.In(v => v.RecipeId, recipeIds)
            );
            var votes = await _voteCollection.Find(filter).ToListAsync();
            return votes.Select(v => v.RecipeId).Distinct().ToList();
        }

        // Public method to populate vote information for a list of recipes
        public async Task PopulateVoteInfoAsync(List<RecipeListItemDto> recipes, string? userId = null)
        {
            if (recipes == null || !recipes.Any())
                return;

            // Get all SpoonacularIds
            var spoonacularIds = recipes.Select(r => r.SpoonacularId).ToList();
            
            // Get local recipe mappings
            var localRecipes = await _recipeService.GetBySpoonacularIdsAsync(spoonacularIds);
            var spoonacularIdToLocalId = localRecipes.ToDictionary(r => r.SpoonacularId, r => r.Id);
            var localRecipeIds = spoonacularIdToLocalId.Values.ToList();

            // Get vote counts and user voted status
            var voteCounts = await GetVoteCountsAsync(localRecipeIds);
            List<string> userVotedIds = new List<string>();
            
            if (!string.IsNullOrEmpty(userId))
            {
                userVotedIds = await GetUserVotedRecipeIdsAsync(userId, localRecipeIds);
            }

            // Populate vote information
            foreach (var recipe in recipes)
            {
                string? localId = spoonacularIdToLocalId.ContainsKey(recipe.SpoonacularId) ? spoonacularIdToLocalId[recipe.SpoonacularId] : null;
                recipe.Likes = (localId != null && voteCounts.ContainsKey(localId)) ? voteCounts[localId] : 0;
                recipe.Voted = !string.IsNullOrEmpty(userId) && (localId != null && userVotedIds.Contains(localId));
            }
        }
    }
} 