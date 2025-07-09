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

        public VoteService(DbService dbService)
        {
            _voteCollection = dbService.GetCollection<Vote>("Votes");
        }

        // Add a vote for a recipe by a user
        public async Task<bool> AddVoteAsync(string userId, int recipeId)
        {
            var exists = await _voteCollection.Find(v => v.UserId == userId && v.RecipeId == recipeId).AnyAsync();
            if (exists) return false;
            await _voteCollection.InsertOneAsync(new Vote { UserId = userId, RecipeId = recipeId });
            return true;
        }

        // Remove a vote for a recipe by a user
        public async Task<bool> RemoveVoteAsync(string userId, int recipeId)
        {
            var result = await _voteCollection.DeleteOneAsync(v => v.UserId == userId && v.RecipeId == recipeId);
            return result.DeletedCount > 0;
        }

        // Get the total vote count for a recipe
        public async Task<int> GetVoteCountAsync(int recipeId)
        {
            return (int)await _voteCollection.CountDocumentsAsync(v => v.RecipeId == recipeId);
        }

        // Check if a user has voted for a recipe
        public async Task<bool> HasUserVotedAsync(string userId, int recipeId)
        {
            return await _voteCollection.Find(v => v.UserId == userId && v.RecipeId == recipeId).AnyAsync();
        }

        // Batch: Get vote counts for a list of recipeIds
        public async Task<Dictionary<int, int>> GetVoteCountsAsync(List<int> recipeIds)
        {
            var filter = Builders<Vote>.Filter.In(v => v.RecipeId, recipeIds);
            var votes = await _voteCollection.Find(filter).ToListAsync();
            return votes.GroupBy(v => v.RecipeId)
                        .ToDictionary(g => g.Key, g => g.Count());
        }

        // Batch: Get recipeIds that the user has voted for from a list
        public async Task<List<int>> GetUserVotedRecipeIdsAsync(string userId, List<int> recipeIds)
        {
            var filter = Builders<Vote>.Filter.And(
                Builders<Vote>.Filter.Eq(v => v.UserId, userId),
                Builders<Vote>.Filter.In(v => v.RecipeId, recipeIds)
            );
            var votes = await _voteCollection.Find(filter).ToListAsync();
            return votes.Select(v => v.RecipeId).Distinct().ToList();
        }
    }
} 