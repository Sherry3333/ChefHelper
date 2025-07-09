using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ChefBackend.Services;
using System.Threading.Tasks;

[ApiController]
[Route("votes")]
public class VoteController : ControllerBase
{
    private readonly VoteService _voteService;

    public VoteController(VoteService voteService)
    {
        _voteService = voteService;
    }

    // Add a vote (like) for a recipe
    [Authorize]
    [HttpPost("{recipeId}")]
    public async Task<IActionResult> AddVote(int recipeId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return BadRequest("User ID not found in token.");
        var result = await _voteService.AddVoteAsync(userId, recipeId);
        if (!result) return Conflict("Already voted");
        return Ok();
    }

    // Remove a vote (unlike) for a recipe
    [Authorize]
    [HttpDelete("{recipeId}")]
    public async Task<IActionResult> RemoveVote(int recipeId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return BadRequest("User ID not found in token.");
        var result = await _voteService.RemoveVoteAsync(userId, recipeId);
        if (!result) return NotFound();
        return Ok();
    }

    // Get whether the current user has voted for a recipe
    [Authorize]
    [HttpGet("{recipeId}/status")]
    public async Task<IActionResult> GetVoteStatus(int recipeId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return BadRequest("User ID not found in token.");
        var voted = await _voteService.HasUserVotedAsync(userId, recipeId);
        return Ok(new { voted });
    }

    // Get the total vote count for a recipe
    [HttpGet("{recipeId}/count")]
    public async Task<IActionResult> GetVoteCount(int recipeId)
    {
        var count = await _voteService.GetVoteCountAsync(recipeId);
        return Ok(new { count });
    }
} 