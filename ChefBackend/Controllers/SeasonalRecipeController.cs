using Microsoft.AspNetCore.Mvc;
using ChefBackend.Services;
using ChefBackend.Models;
using System.Collections.Generic;
using System.Linq;
using System;
using System.Security.Claims;


[ApiController]
[Route("recipes/")]
public class SeasonalRecipeController : ControllerBase
{
    private readonly ILogger<SeasonalRecipeController> _logger;
    private readonly SeasonalIngredientService _ingredientService;
    private readonly SpoonacularService _spoonacularService;
    private readonly SeasonalRecipeCacheService _cacheService;
    private readonly VoteService _voteService;
    private readonly RecipeService _recipeService;

    public SeasonalRecipeController(
        ILogger<SeasonalRecipeController> logger, 
        SeasonalIngredientService ingredientService, 
        SpoonacularService spoonacularService,
        SeasonalRecipeCacheService cacheService,
        VoteService voteService,
        RecipeService recipeService)
    {
        _logger = logger;
        _ingredientService = ingredientService;
        _spoonacularService = spoonacularService;
        _cacheService = cacheService;
        _voteService = voteService;
        _recipeService = recipeService;
    }

    // Request model for recipe by location
    public class RecipeByLocationRequest
    {
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public int Count { get; set; } = 9;
    }

    /// <summary>
    /// Get seasonal recipes by location (latitude, longitude) with caching
    /// </summary>
    [HttpPost("seasonal")]
    public async Task<IActionResult> GetRecipesByLocation([FromBody] RecipeByLocationRequest request)
    {
        try
        {
            double lat = request.Latitude ?? 0.0;
            double lon = request.Longitude ?? 0.0;
            var season = SeasonalConfig.GetCurrentSeason(lat, lon);
            var region = lat < 0 ? "South" : "North";

            // try to get cached recipes
            var cachedRecipes = _cacheService.GetSeasonalRecipes(season, region);
            List<RecipeListItemDto> dtos;
            
            if (cachedRecipes != null)
            {
                // Use cached data but reset vote information to be recalculated
                dtos = cachedRecipes.Take(request.Count).Select(r => new RecipeListItemDto
                {
                    SpoonacularId = r.SpoonacularId,
                    Title = r.Title,
                    Image = r.Image,
                    Likes = 0, // will be recalculated below
                    Voted = false // will be recalculated below
                }).ToList();
            }
            else
            {
                // Cache miss - fetch from API
                var ingredients = await _ingredientService.GetBySeasonAndRegionAsync(season, region);
                var ingredientNames = ingredients.Select(i => i.Ingredient).ToList();
                var random = new Random();
                var selectedIngredients = ingredientNames.OrderBy(x => random.Next()).Take(3).ToList();
                var allRecipes = new List<SpoonacularRecipeResult>();
                foreach (var ingredient in selectedIngredients)
                {
                    var recipes = await _spoonacularService.FindRecipesByIngredientsAsync(new List<string> { ingredient }, 3);
                    if (recipes != null)
                        allRecipes.AddRange(recipes);
                }
                var uniqueRecipes = allRecipes.GroupBy(r => r.Id).Select(g => g.First()).Take(request.Count).ToList();
                
                // Create DTOs with default vote values
                dtos = uniqueRecipes.Select(r => new RecipeListItemDto
                {
                    SpoonacularId = r.Id,
                    Title = r.Title,
                    Image = r.Image,
                    Likes = 0, // will be recalculated below
                    Voted = false
                }).ToList();
                
                // Cache the recipes (with default vote values, will be recalculated on retrieval)
                _cacheService.SetSeasonalRecipes(season, region, dtos);
            }

            // Always recalculate vote information (whether from cache or fresh data)
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _voteService.PopulateVoteInfoAsync(dtos, userId);
            
            return Ok(dtos);
        }
        catch (SpoonacularQuotaException ex)
        {
            return StatusCode(402, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting seasonal recipes for location {Lat}, {Lon}", request.Latitude, request.Longitude);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRecipeDetail(int id)
    {
        try
        {
            // try to get cached recipe detail
            var cachedDetail = _cacheService.GetRecipeDetail(id);
            if (cachedDetail != null)
            {
                _logger.LogInformation("Returning cached recipe detail for {Id}", id);
                return Ok(cachedDetail);
            }

            // cache miss, fetch from API
            _logger.LogInformation("Cache miss for recipe detail {Id}, fetching from API", id);
            var detail = await _spoonacularService.GetRecipeDetailAsync(id);
            
            // Map to RecipeDetailDto for consistent frontend usage
            var dto = new RecipeDetailDto
            {
                SpoonacularId = detail.Id,
                Title = detail.Title,
                Image = detail.Image,
                Ingredients = detail.ExtendedIngredients?.Select(i => i.Original).ToList() ?? new List<string>(),
                Instructions = detail.Instructions
            };

            // save to cache
            _cacheService.SetRecipeDetail(id, dto);
            _logger.LogInformation("Cached recipe detail for {Id}", id);

            return Ok(dto);
        }
        catch (SpoonacularQuotaException ex)
        {
            return StatusCode(402, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // Request model for recipes by ingredients
    public class RecipeByIngredientsRequest
    {
        public string Ingredients { get; set; } = string.Empty;
        public int Count { get; set; } = 3;
    }

    // Request model for recipe search
    public class RecipeSearchRequest
    {
        public string Query { get; set; } = string.Empty;
        public int Count { get; set; } = 10;
    }

    /// <summary>
    /// Search recipes by query string
    /// </summary>
    [HttpPost("search")]
    public async Task<IActionResult> SearchRecipes([FromBody] RecipeSearchRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Query))
            {
                return BadRequest("Search query cannot be empty");
            }
            var recipes = await _spoonacularService.SearchRecipesAsync(request.Query, request.Count);
            var dtos = recipes.Select(r => new RecipeListItemDto
            {
                SpoonacularId = r.Id,
                Title = r.Title,
                Image = r.Image,
                Likes = 0, // will fill below
                Voted = false
            }).ToList();
            
            // Add vote information using the centralized method
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _voteService.PopulateVoteInfoAsync(dtos, userId);
            
            return Ok(dtos);
        }
        catch (SpoonacularQuotaException ex)
        {
            return StatusCode(402, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching recipes: {Query}", request.Query);
            return StatusCode(500, new { error = "Failed to search recipes. Please try again later." });
        }
    }

    /// <summary>
    /// Get recipes by ingredients string
    /// </summary>
    [HttpPost("byIngredients")]
    public async Task<IActionResult> GetRecipesByIngredients([FromBody] RecipeByIngredientsRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Ingredients))
            {
                return BadRequest("Ingredients cannot be empty");
            }
            var recipes = await _spoonacularService.FindRecipesByIngredientsAsync(request.Ingredients, request.Count);
            var dtos = recipes.Select(r => new RecipeListItemDto
            {
                SpoonacularId = r.Id,
                Title = r.Title,
                Image = r.Image,
                Likes = 0, // will fill below
                Voted = false
            }).ToList();
            
            // Add vote information using the centralized method
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _voteService.PopulateVoteInfoAsync(dtos, userId);
            
            return Ok(dtos);
        }
        catch (SpoonacularQuotaException ex)
        {
            return StatusCode(402, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recipes by ingredients: {Ingredients}", request.Ingredients);
            return StatusCode(500, new { error = "Failed to get recipes. Please try again later." });
        }
    }
} 