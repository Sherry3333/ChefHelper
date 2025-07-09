using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ChefBackend.Services;
using ChefBackend.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

[ApiController]
[Route("favorites")]
public class FavoriteController : ControllerBase
{
    private readonly FavoriteService _favoriteService;
    private readonly RecipeService _recipeService;
    private readonly VoteService _voteService;

    // Only keep this constructor!
    public FavoriteController(FavoriteService favoriteService, RecipeService recipeService, VoteService voteService)
    {
        _favoriteService = favoriteService;
        _recipeService = recipeService;
        _voteService = voteService;
    }

    // Get all favorited recipes for the current user, with like count and voted status
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

        // Convert to List<int> of SpoonacularId for vote info
        var spoonacularIds = recipes.Select(r => r.SpoonacularId).ToList();
        var voteCounts = await _voteService.GetVoteCountsAsync(spoonacularIds);
        var userVotedIds = await _voteService.GetUserVotedRecipeIdsAsync(userId, spoonacularIds);

        var result = recipes.Select(r => new {
            r.Id,
            r.SpoonacularId,
            r.Title,
            r.Image,
            r.Ingredients,
            r.Instructions,
            // Add other fields as needed
            Likes = voteCounts.ContainsKey(r.SpoonacularId) ? voteCounts[r.SpoonacularId] : 0,
            Voted = userVotedIds.Contains(r.SpoonacularId)
        });

        return Ok(result);
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