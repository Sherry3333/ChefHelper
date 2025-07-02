using MongoDB.Driver;
using ChefBackend.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ChefBackend.Services
{
    public class FavoriteService
    {
        private readonly IMongoCollection<Favorite> _favoriteCollection;
        private readonly RecipeService _recipeService;
        private readonly SpoonacularService _spoonacularService;

        public FavoriteService(DbService dbService, RecipeService recipeService, SpoonacularService spoonacularService)
        {
            _favoriteCollection = dbService.GetCollection<Favorite>("Favorites");
            _recipeService = recipeService;
            _spoonacularService = spoonacularService;
        }

        // Get all favorites for a user
        public async Task<List<Favorite>> GetFavoritesByUserIdAsync(string userId)
        {
            return await _favoriteCollection.Find(f => f.UserId == userId).ToListAsync();
        }

        // Add a favorite (if recipe not exists, fetch and save)
        public async Task<bool> AddFavoriteAsync(string userId, int spoonacularId)
        {
            // Check if recipe exists
            var recipe = await _recipeService.GetBySpoonacularIdAsync(spoonacularId);
            if (recipe == null)
            {
                // Fetch from Spoonacular and save
                var detail = await _spoonacularService.GetRecipeDetailAsync(spoonacularId);
                recipe = await _recipeService.CreateFromSpoonacularAsync(detail);
            }

            // Check if favorite already exists
            var exists = await _favoriteCollection.Find(f => f.UserId == userId && f.RecipeId == recipe.Id).AnyAsync();
            if (exists) return false;

            // Add favorite
            var favorite = new Favorite
            {
                UserId = userId,
                RecipeId = recipe.Id,
                CreatedAt = DateTime.UtcNow
            };
            await _favoriteCollection.InsertOneAsync(favorite);
            return true;
        }

        // Remove a favorite
        public async Task<bool> RemoveFavoriteAsync(string userId, int spoonacularId)
        {
            var recipe = await _recipeService.GetBySpoonacularIdAsync(spoonacularId);
            if (recipe == null) return false;
            var result = await _favoriteCollection.DeleteOneAsync(f => f.UserId == userId && f.RecipeId == recipe.Id);
            return result.DeletedCount > 0;
        }
    }
}
