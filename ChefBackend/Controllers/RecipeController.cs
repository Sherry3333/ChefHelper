
using Microsoft.AspNetCore.Mvc;


[ApiController]
[Route("/recipe")]
public class RecipeController : ControllerBase{
    private readonly RecipeService _dbService;

    public RecipeController(RecipeService recipeService){
        _dbService = recipeService;
    }

    //Get all 
    [HttpGet("all")]    
    public async Task<List<Recipe>> Get() =>await _dbService.GetAsync();

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