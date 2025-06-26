using Microsoft.AspNetCore.Mvc;
using ChefBackend.Services;


[ApiController]
[Route("season/")]
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
    [HttpPost("recipes")]
    public async Task<IActionResult> GetRecipesByLocation([FromBody] RecipeByLocationRequest request)
    {
        // 1. Default to 0,0 if not provided
        double lat = request.Latitude ?? 0.0;
        double lon = request.Longitude ?? 0.0;

        // 2. Determine season and region
        var season = SeasonalConfig.GetCurrentSeason(lat, lon);
        var region = lat < 0 ? "South" : "North";

        // 3. Get ingredients by season and region
        var ingredients = await _ingredientService.GetBySeasonAndRegionAsync(season, region);
        var ingredientNames = ingredients.Select(i => i.Ingredient).ToList();

        // 4. Randomly select 3 unique ingredients
        var random = new Random();
        var selectedIngredients = ingredientNames.OrderBy(x => random.Next()).Take(3).ToList();

        // 5. For each ingredient, call Spoonacular API (single ingredient per call, 3 recipes per call)
        var allRecipes = new List<SpoonacularRecipeResult>();
        foreach (var ingredient in selectedIngredients)
        {
            var recipes = await _spoonacularService.FindRecipesByIngredientsAsync(new List<string> { ingredient }, 3);
            if (recipes != null)
                allRecipes.AddRange(recipes);
        }

        // 6. Remove duplicate recipes by id, return up to count recipes
        var uniqueRecipes = allRecipes.GroupBy(r => r.Id).Select(g => g.First()).Take(request.Count).ToList();

        return Ok(uniqueRecipes);
    }

    [HttpGet("recipes/{id}")]
    public async Task<IActionResult> GetRecipeDetail(int id)
    {
        var detail = await _spoonacularService.GetRecipeDetailAsync(id);
        return Ok(detail);
    }
} 