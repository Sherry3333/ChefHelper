using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ChefBackend.Services;
using ChefBackend.Models;
using System.IdentityModel.Tokens.Jwt;

[ApiController]
[Route("user/")]
public class UserController : ControllerBase
{
    private readonly UserService _userService;
    private readonly RecipeService _recipeService;

    public UserController(UserService userService, RecipeService recipeService)
    {
        _userService = userService;
        _recipeService = recipeService;
    }

    [Authorize]
    [HttpGet("favorites")]
    public async Task<IActionResult> GetFavorites()
    {
        
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("User ID not found in token");
        }
        
        var user = await _userService.GetByIdAsync(userId);
        if (user == null) return Unauthorized();

        var recipes = await _recipeService.GetByIdsAsync(user.Favorites);
        return Ok(recipes);
    }

    [Authorize]
    [HttpPost("favorites/{recipeId}")]
    public async Task<IActionResult> AddFavorite(string recipeId)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = await _userService.GetByIdAsync(userId);
        if (user == null) return Unauthorized();

        if (!user.Favorites.Contains(recipeId))
        {
            user.Favorites.Add(recipeId);
            await _userService.UpdateAsync(userId, user);
        }
        return Ok();
    }

    [Authorize]
    [HttpDelete("favorites/{recipeId}")]
    public async Task<IActionResult> RemoveFavorite(string recipeId)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = await _userService.GetByIdAsync(userId);
        if (user == null) return Unauthorized();

        if (user.Favorites.Contains(recipeId))
        {
            user.Favorites.Remove(recipeId);
            await _userService.UpdateAsync(userId, user);
        }
        return Ok();
    }
}
