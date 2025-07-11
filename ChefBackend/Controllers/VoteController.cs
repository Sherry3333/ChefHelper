using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ChefBackend.Services;
using ChefBackend.Models;
using System.Threading.Tasks;

public class VoteRequest
{
    public string? RecipeId { get; set; }
    public int? SpoonacularId { get; set; }
}

[ApiController]
[Route("votes")]
public class VoteController : ControllerBase
{
    private readonly VoteService _voteService;
    private readonly RecipeService _recipeService;
    private readonly SpoonacularService _spoonacularService;

    public VoteController(VoteService voteService, RecipeService recipeService, SpoonacularService spoonacularService)
    {
        _voteService = voteService;
        _recipeService = recipeService;
        _spoonacularService = spoonacularService;
    }

    // Helper to resolve the correct recipeId
    private async Task<string?> ResolveRecipeIdAsync(VoteRequest request)
    {
        // If RecipeId is provided directly, use it
        if (!string.IsNullOrEmpty(request.RecipeId))
        {
            return request.RecipeId;
        }
        
        // If SpoonacularId is provided, try to find or create local recipe
        if (request.SpoonacularId.HasValue && request.SpoonacularId.Value > 0)
        {
            var localRecipe = await _recipeService.GetBySpoonacularIdAsync(request.SpoonacularId.Value);
            if (localRecipe != null)
                return localRecipe.Id;
        }
        
        return null;
    }

    // Add a vote (like) for a recipe
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> AddVote([FromBody] VoteRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return BadRequest("User ID not found in token.");

        string? recipeId = request.RecipeId;
        int? spoonacularId = request.SpoonacularId;

        // If spoonacularId > 0, ensure the recipe exists locally
        if (spoonacularId.HasValue && spoonacularId.Value > 0)
        {
            var localRecipe = await _recipeService.GetBySpoonacularIdAsync(spoonacularId.Value);
            if (localRecipe == null)
            {
                try
                {
                    // Fetch from Spoonacular API and insert into local database
                    var detail = await _spoonacularService.GetRecipeDetailAsync(spoonacularId.Value);
                    if (detail == null)
                        return BadRequest("Recipe not found in Spoonacular API.");
                    localRecipe = await _recipeService.CreateFromSpoonacularAsync(detail);
                }
                catch (SpoonacularQuotaException ex)
                {
                    return StatusCode(402, new { error = ex.Message });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { error = "Failed to fetch recipe from external API." });
                }
            }
            recipeId = localRecipe.Id;
        }

        if (string.IsNullOrEmpty(recipeId))
            return BadRequest("RecipeId or valid SpoonacularId required.");

        var result = await _voteService.AddVoteAsync(userId, recipeId);
        if (!result) return Conflict("Already voted");
        return Ok();
    }

    // Remove a vote (unlike) for a recipe
    [Authorize]
    [HttpDelete]
    public async Task<IActionResult> RemoveVote([FromBody] VoteRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return BadRequest("User ID not found in token.");

        string? recipeId = await ResolveRecipeIdAsync(request);
        if (string.IsNullOrEmpty(recipeId))
            return BadRequest("RecipeId or valid SpoonacularId required.");

        var result = await _voteService.RemoveVoteAsync(userId, recipeId);
        if (!result) return NotFound("Vote not found");
        return Ok();
    }

    // Get whether the current user has voted for a recipe
    [Authorize]
    [HttpPost("status")]
    public async Task<IActionResult> GetVoteStatus([FromBody] VoteRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return BadRequest("User ID not found in token.");

        string? recipeId = await ResolveRecipeIdAsync(request);
        if (string.IsNullOrEmpty(recipeId))
        {
            // If the recipe does not exist locally, treat as not voted
            return Ok(new { voted = false });
        }

        var voted = await _voteService.HasUserVotedAsync(userId, recipeId);
        return Ok(new { voted });
    }

    // Get the total vote count for a recipe
    [HttpPost("count")]
    public async Task<IActionResult> GetVoteCount([FromBody] VoteRequest request)
    {
        string? recipeId = await ResolveRecipeIdAsync(request);
        if (string.IsNullOrEmpty(recipeId))
        {
            // If the recipe does not exist locally, treat as 0 votes
            return Ok(new { count = 0 });
        }

        var count = await _voteService.GetVoteCountAsync(recipeId);
        return Ok(new { count });
    }
} 