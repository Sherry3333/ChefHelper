
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using ChefBackend.Models;
using ChefBackend.Services;
using Microsoft.AspNetCore.Http;


[ApiController]
[Route("myrecipe/")]
[Authorize]
public class RecipeController : ControllerBase{
    private readonly RecipeService _dbService;
    private readonly VoteService _voteService;
    private readonly CloudinaryService _cloudinaryService;

    public RecipeController(RecipeService recipeService, VoteService voteService, CloudinaryService cloudinaryService){
        _dbService = recipeService;
        _voteService = voteService;
        _cloudinaryService = cloudinaryService;
    }

    //Get all 
    [HttpGet("all")]    
    [AllowAnonymous]
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
        var recipeIds = recipes.Select(r => r.Id).ToList();
        var voteCounts = await _voteService.GetVoteCountsAsync(recipeIds);

        List<string> userVotedIds = new List<string>();
        if (User.Identity.IsAuthenticated)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            userVotedIds = await _voteService.GetUserVotedRecipeIdsAsync(userId, recipeIds);
        }

        foreach (var recipe in recipes)
        {
            recipe.Likes = voteCounts.ContainsKey(recipe.Id) ? voteCounts[recipe.Id] : 0;
            recipe.Voted = userVotedIds.Contains(recipe.Id);
        }

        return recipes;
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<Recipe>> GetById(string id){
    
        var recipe = await _dbService.GetByIdAsync(id);
        if (recipe == null)
        {
            return NotFound(new { code = 40401, message = "User not found" });
        }
        return recipe;
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddRecipe([FromForm] RecipeFormDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        string imageUrl = "";

        // Upload image to Cloudinary
        if (dto.Image != null && dto.Image.Length > 0)
        {
            try
            {
                imageUrl = await _cloudinaryService.UploadImageAsync(dto.Image);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Failed to upload image: {ex.Message}" });
            }
        }

        // Deserialize ingredients from JSON string
        var ingredientsList = System.Text.Json.JsonSerializer.Deserialize<List<string>>(dto.Ingredients);

        var recipe = new Recipe
        {
            Title = dto.Title,
            Ingredients = ingredientsList,
            Instructions = dto.Instructions,
            Image = imageUrl,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _dbService.CreateAsync(recipe);
        return CreatedAtAction(nameof(GetById), new { id = recipe.Id }, recipe);
    }
    

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromForm] RecipeFormDto dto)
    {
        var recipeDb = await _dbService.GetByIdAsync(id);
        if (recipeDb == null)
        {
            return NotFound(new { code = 40401, message = "User not found" });
        }

        // Only update title if provided
        if (!string.IsNullOrWhiteSpace(dto.Title))
            recipeDb.Title = dto.Title;

        // Only update instructions if provided
        if (!string.IsNullOrWhiteSpace(dto.Instructions))
            recipeDb.Instructions = dto.Instructions;

        // Only update ingredients if provided and valid JSON array
        if (!string.IsNullOrWhiteSpace(dto.Ingredients))
        {
            try
            {
                var ingredientsList = System.Text.Json.JsonSerializer.Deserialize<List<string>>(dto.Ingredients);
                recipeDb.Ingredients = ingredientsList;
            }
            catch
            {
                return BadRequest("Ingredients must be a JSON array of strings or empty.");
            }
        }

        // Only update image if a new file is uploaded
        if (dto.Image != null && dto.Image.Length > 0)
        {
            try
            {
                // Delete old image from Cloudinary if it exists
                if (!string.IsNullOrEmpty(recipeDb.Image))
                {
                    await _cloudinaryService.DeleteImageAsync(recipeDb.Image);
                }
                
                // Upload new image to Cloudinary
                recipeDb.Image = await _cloudinaryService.UploadImageAsync(dto.Image);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Failed to update image: {ex.Message}" });
            }
        }
        // If no new image, keep the old image

        await _dbService.UpdateAsync(id, recipeDb);
        return NoContent();
    }

    [HttpDelete("{id}")]    
    public async Task<IActionResult> Delete(string id){ 
        var recipe = await _dbService.GetByIdAsync(id);
        if (recipe != null && !string.IsNullOrEmpty(recipe.Image))
        {
            // Delete image from Cloudinary
            await _cloudinaryService.DeleteImageAsync(recipe.Image);
        }
        
        await _dbService.DeleteAsync(id);
        return NoContent();
    }




}