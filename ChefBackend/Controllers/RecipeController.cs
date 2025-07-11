
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

        // Save image file to wwwroot/uploads and generate URL
        if (dto.Image != null && dto.Image.Length > 0)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Image.CopyToAsync(stream);
            }
            // Generate image URL for client access
            imageUrl = $"/uploads/{fileName}";
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
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Image.CopyToAsync(stream);
            }
            
            // Delete old image file to save disk space (if exists and is not default image)
            if (!string.IsNullOrEmpty(recipeDb.Image) && recipeDb.Image.StartsWith("/uploads/"))
            {
                var oldImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", recipeDb.Image.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));
                if (System.IO.File.Exists(oldImagePath))
                {
                    try 
                    { 
                        System.IO.File.Delete(oldImagePath); 
                    } 
                    catch (Exception ex) 
                    { 
                        // Log error but don't fail the update operation
                        // In production, you might want to use a proper logging framework
                        Console.WriteLine($"Failed to delete old image: {ex.Message}");
                    }
                }
            }
            
            // Generate new image URL for client access
            recipeDb.Image = $"/uploads/{fileName}";
        }
        // If no new image, keep the old image

        await _dbService.UpdateAsync(id, recipeDb);
        return NoContent();
    }

    [HttpDelete("{id}")]    
    public async Task<IActionResult> Delete(string id){ 
         await _dbService.DeleteAsync(id);
         return NoContent();

    }




}