using Microsoft.AspNetCore.Mvc;
using ChefBackend.Services;

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

}
