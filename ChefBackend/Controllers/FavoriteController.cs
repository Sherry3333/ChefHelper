using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ChefBackend.Services;
using ChefBackend.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

[ApiController]
[Route("favorites")]
public class FavoriteController : ControllerBase
{
    private readonly FavoriteService _favoriteService;
    private readonly RecipeService _recipeService;

    public FavoriteController(FavoriteService favoriteService, RecipeService recipeService)
    {
        _favoriteService = favoriteService;
        _recipeService = recipeService;
    }

    // Get all favorited recipes for the current user
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetFavorites()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        // If userId is missing from token, return clear error
        if (string.IsNullOrEmpty(userId))
            return BadRequest("User ID not found in token. Please re-login or contact support.");
        var favorites = await _favoriteService.GetFavoritesByUserIdAsync(userId);
        var recipeIds = favorites.ConvertAll(f => f.RecipeId);
        var recipes = await _recipeService.GetByIdsAsync(recipeIds);
        return Ok(recipes);
    }

    // Add a favorite (by spoonacularId)
    [Authorize]
    [HttpPost("{spoonacularId}")]
    public async Task<IActionResult> AddFavorite(int spoonacularId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        // If userId is missing from token, return clear error
        if (string.IsNullOrEmpty(userId))
            return BadRequest("User ID not found in token. Please re-login or contact support.");
        var result = await _favoriteService.AddFavoriteAsync(userId, spoonacularId);
        if (!result)
            return Conflict("Already favorited");
        return Ok();
    }

    // Remove a favorite (by spoonacularId)
    [Authorize]
    [HttpDelete("{spoonacularId}")]
    public async Task<IActionResult> RemoveFavorite(int spoonacularId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        // If userId is missing from token, return clear error
        if (string.IsNullOrEmpty(userId))
            return BadRequest("User ID not found in token. Please re-login or contact support.");
        var result = await _favoriteService.RemoveFavoriteAsync(userId, spoonacularId);
        if (!result)
            return NotFound();
        return Ok();
    }
} 