using Microsoft.AspNetCore.Mvc;
using ChefBackend.Services;
using System.Collections.Generic;
using System.Linq;

// DTO for recipe list items (for cards)
public class RecipeListItemDto
{
    public int SpoonacularId { get; set; }
    public string Title { get; set; }
    public string Image { get; set; }
    public int Likes { get; set; }
}

// DTO for recipe detail
public class RecipeDetailDto
{
    public int SpoonacularId { get; set; }
    public string Title { get; set; }
    public string Image { get; set; }
    public List<string> Ingredients { get; set; }
    public string Instructions { get; set; }
    // Add more fields as needed
}

[ApiController]
[Route("recipes/")]
public class SeasonalRecipeController : ControllerBase
{
    private readonly ILogger<SeasonalRecipeController> _logger;
    private readonly SeasonalIngredientService _ingredientService;
    private readonly SpoonacularService _spoonacularService;

    public SeasonalRecipeController(ILogger<SeasonalRecipeController> logger, SeasonalIngredientService ingredientService, SpoonacularService spoonacularService)
    {
        _logger = logger;
        _ingredientService = ingredientService;
        _spoonacularService = spoonacularService;
    }

    // Request model for recipe by location
    public class RecipeByLocationRequest
    {
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public int Count { get; set; } = 9;
    }

    /// <summary>
    /// Get seasonal recipes by location (latitude, longitude)
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
            // Map to RecipeListItemDto for consistent frontend usage
            var dtos = uniqueRecipes.Select(r => new RecipeListItemDto
            {
                SpoonacularId = r.Id,
                Title = r.Title,
                Image = r.Image,
                Likes = r.Likes
            }).ToList();
            return Ok(dtos);
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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRecipeDetail(int id)
    {
        try
        {
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
            // Map to RecipeListItemDto for consistent frontend usage
            var dtos = recipes.Select(r => new RecipeListItemDto
            {
                SpoonacularId = r.Id,
                Title = r.Title,
                Image = r.Image,
                Likes = r.Likes
            }).ToList();
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