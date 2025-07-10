
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using ChefBackend.Models;
using ChefBackend.Services;


[ApiController]
[Route("myrecipe/")]
[Authorize]
public class RecipeController : ControllerBase{
    private readonly RecipeService _dbService;
    private readonly VoteService _voteService;

    public RecipeController(RecipeService recipeService, VoteService voteService){
        _dbService = recipeService;
        _voteService = voteService;
    }

    //Get all 
    [HttpGet("all")]    
    public async Task<List<Recipe>> Get() =>await _dbService.GetAsync();

    // get all recipes created by the current user
    [HttpGet("mine")]
    public async Task<List<Recipe>> GetMine(){
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var recipes = await _dbService.GetByCreatorAsync(userId);
        
        // Add vote information
        var recipeIds = recipes.Select(r => r.Id).ToList();
        var voteCounts = await _voteService.GetVoteCountsAsync(recipeIds);
        var userVotedIds = await _voteService.GetUserVotedRecipeIdsAsync(userId, recipeIds);
        
        foreach (var recipe in recipes)
        {
            recipe.Likes = voteCounts.ContainsKey(recipe.Id) ? voteCounts[recipe.Id] : 0;
            recipe.Voted = userVotedIds.Contains(recipe.Id);
        }
        
        return recipes;
    }

    // get all user created recipes
    [HttpGet("allUserCreated")]
    [AllowAnonymous]
    public async Task<List<Recipe>> GetAllUserCreated()
    {
        var recipes = await _dbService.GetAllUserCreatedAsync();
        
        // Add vote information for anonymous users (only counts, no voted status)
        var recipeIds = recipes.Select(r => r.Id).ToList();
        var voteCounts = await _voteService.GetVoteCountsAsync(recipeIds);
        
        foreach (var recipe in recipes)
        {
            recipe.Likes = voteCounts.ContainsKey(recipe.Id) ? voteCounts[recipe.Id] : 0;
            recipe.Voted = false; // Anonymous users can't vote
        }
        
        return recipes;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Recipe>> GetById(string id){
    
        var recipe = await _dbService.GetByIdAsync(id);
        if (recipe == null)
        {
            return NotFound(new { code = 40401, message = "User not found" });
        }
        return recipe;
    }

    [HttpPost("add")]
    public async Task<IActionResult> addRecipe([FromBody] Recipe recipe){
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        recipe.CreatedBy = userId;
        recipe.CreatedAt = DateTime.UtcNow;
        await _dbService.CreateAsync(recipe);
        return CreatedAtAction(nameof(GetById), new { id = recipe.Id }, recipe);
    }
    

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] Recipe recipe){
        var recipeDb = await _dbService.GetByIdAsync(id);
        if (recipeDb == null)
        {
            return NotFound(new { code = 40401, message = "User not found" });
        }
       
        await _dbService.UpdateAsync(id, recipe);
        return NoContent();
    }

    [HttpDelete("{id}")]    
    public async Task<IActionResult> Delete(string id){ 
         await _dbService.DeleteAsync(id);
         return NoContent();

    }




}