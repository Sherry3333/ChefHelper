using System.Collections.Generic;

namespace ChefBackend.Models
{
    // DTO for recipe detail
    public class RecipeDetailDto
    {
        public int SpoonacularId { get; set; }
        public string Title { get; set; }
        public string Image { get; set; }
        public List<string> Ingredients { get; set; }
        public string Instructions { get; set; }
        // Add more fields as needed
    }

    // DTO for recipe list items (keep consistent with frontend)
    public class RecipeListItemDto
    {
        public int SpoonacularId { get; set; }
        public string Title { get; set; }
        public string Image { get; set; }
        public int Likes { get; set; }
        public bool Voted { get; set; } // Whether the current user has voted (liked) this recipe
    }
} 