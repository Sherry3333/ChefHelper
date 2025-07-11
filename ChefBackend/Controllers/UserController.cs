using Microsoft.AspNetCore.Mvc;
using ChefBackend.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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
    [HttpGet("profile")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();
        var user = await _userService.GetByIdAsync(userId);
        if (user == null)
            return NotFound();
        return Ok(user);
    }
}
