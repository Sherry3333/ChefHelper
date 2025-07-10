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
        if (string.IsNullOrEmpty(userId))
            return BadRequest("User ID not found in token. Please re-login or contact support.");
        var favorites = await _favoriteService.GetFavoritesByUserIdAsync(userId);
        var recipeIds = favorites.ConvertAll(f => f.RecipeId);
        var recipes = await _recipeService.GetByIdsAsync(recipeIds);

        // Use recipeIds for vote info
        var voteCounts = await _voteService.GetVoteCountsAsync(recipeIds);
        var userVotedIds = await _voteService.GetUserVotedRecipeIdsAsync(userId, recipeIds);

        var result = recipes.Select(r => new {
            r.Id,
            r.SpoonacularId,
            r.Title,
            r.Image,
            r.Ingredients,
            r.Instructions,
            Likes = voteCounts.ContainsKey(r.Id) ? voteCounts[r.Id] : 0,
            Voted = userVotedIds.Contains(r.Id)
        });

        return Ok(result);
    }

    // Add a favorite
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> AddFavorite([FromBody] FavoriteRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return BadRequest("User ID not found in token. Please re-login or contact support.");
        var result = await _favoriteService.AddFavoriteAsync(userId, request);
        if (!result)
            return Conflict("Already favorited or recipe not found.");
        return Ok();
    }

    // Remove a favorite
    [Authorize]
    [HttpDelete]
    public async Task<IActionResult> RemoveFavorite([FromBody] FavoriteRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return BadRequest("User ID not found in token. Please re-login or contact support.");
        
        // Always return 200 OK, even if not found (idempotent operation)
        await _favoriteService.RemoveFavoriteAsync(userId, request);
        return Ok();
    }
} 