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

        // Helper to resolve the correct recipeId
        public async Task<string> ResolveRecipeIdAsync(FavoriteRequest request)
        {
            if (!string.IsNullOrEmpty(request.RecipeId))
            {
                return request.RecipeId;
            }
            if (request.SpoonacularId.HasValue && request.SpoonacularId.Value > 0)
            {
                var localRecipe = await _recipeService.GetBySpoonacularIdAsync(request.SpoonacularId.Value);
                if (localRecipe != null)
                    return localRecipe.Id;
            }
            throw new Exception("RecipeId or valid SpoonacularId required.");
        }

        // Get all favorites for a user
        public async Task<List<Favorite>> GetFavoritesByUserIdAsync(string userId)
        {
            return await _favoriteCollection.Find(f => f.UserId == userId).ToListAsync();
        }

        // Add a favorite (if recipe not exists, fetch and save)
        public async Task<bool> AddFavoriteAsync(string userId, FavoriteRequest request)
        {
            string recipeId;
            try
            {
                recipeId = await ResolveRecipeIdAsync(request);
            }
            catch
            {
                // If not found and spoonacularId > 0, try to fetch and insert
                if (request.SpoonacularId.HasValue && request.SpoonacularId.Value > 0)
                {
                    var detail = await _spoonacularService.GetRecipeDetailAsync(request.SpoonacularId.Value);
                    if (detail == null) return false;
                    var newRecipe = await _recipeService.CreateFromSpoonacularAsync(detail);
                    recipeId = newRecipe.Id;
                }
                else
                {
                    return false;
                }
            }

            // Check if favorite already exists
            var exists = await _favoriteCollection.Find(f => f.UserId == userId && f.RecipeId == recipeId).AnyAsync();
            if (exists) return false;

            // Add favorite
            var favorite = new Favorite
            {
                UserId = userId,
                RecipeId = recipeId,
                CreatedAt = DateTime.UtcNow
            };
            await _favoriteCollection.InsertOneAsync(favorite);
            return true;
        }

        // Remove a favorite
        public async Task<bool> RemoveFavoriteAsync(string userId, FavoriteRequest request)
        {
            string recipeId;
            try
            {
                recipeId = await ResolveRecipeIdAsync(request);
            }
            catch
            {
                // If the recipe does not exist locally, treat as not favorited (already removed)
                return true;
            }
            var result = await _favoriteCollection.DeleteOneAsync(f => f.UserId == userId && f.RecipeId == recipeId);
            return result.DeletedCount > 0;
        }
    }
}
