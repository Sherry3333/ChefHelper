using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ChefBackend.Models
{
    public class Recipe
    {
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; } // Database generated

    [BsonElement("spoonacularId")]
    public int SpoonacularId { get; set; }

    [BsonElement("title")]
    public string Title { get; set; }

    [BsonElement("image")]
    public string Image { get; set; }

    [BsonElement("summary")]
    public string? Summary { get; set; } // Can be null

    [BsonElement("instructions")]
    public string Instructions { get; set; }

    [BsonElement("ingredients")]
    public List<string> Ingredients { get; set; }

    [BsonElement("readyInMinutes")]
    public int ReadyInMinutes { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("createdBy")]
    public string? CreatedBy { get; set; } // Nullable, set in controller for add

    // Vote information (not stored in database, computed at runtime)
    [BsonIgnore]
    public int Likes { get; set; } = 0;

    [BsonIgnore]
    public bool Voted { get; set; } = false;
    }
}