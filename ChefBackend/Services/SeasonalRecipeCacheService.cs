using ChefBackend.Models;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ChefBackend.Services
{
    public class SeasonalRecipeCacheService
    {
        private readonly IMemoryCache _memoryCache;

        public SeasonalRecipeCacheService(IMemoryCache memoryCache)
        {
            _memoryCache = memoryCache;
        }

        // get cache
        public List<RecipeListItemDto> GetSeasonalRecipes(string season, string hemisphere)
        {
            var cacheKey = $"seasonal_{season}_{hemisphere}";
            return _memoryCache.Get<List<RecipeListItemDto>>(cacheKey);
        }

        // save cache
        public void SetSeasonalRecipes(string season, string hemisphere, List<RecipeListItemDto> recipes)
        {
            var cacheKey = $"seasonal_{season}_{hemisphere}";
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(1) // 1 day later expires
            };
            _memoryCache.Set(cacheKey, recipes, cacheOptions);
        }

        // get cache detail
        public RecipeDetailDto GetRecipeDetail(int recipeId)
        {
            var cacheKey = $"recipe_detail_{recipeId}";
            return _memoryCache.Get<RecipeDetailDto>(cacheKey);
        }

        // save cache detail
        public void SetRecipeDetail(int recipeId, RecipeDetailDto detail)
        {
            var cacheKey = $"recipe_detail_{recipeId}";
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(7) // 7 days later expires
            };
            _memoryCache.Set(cacheKey, detail, cacheOptions);
        }
    }
} 