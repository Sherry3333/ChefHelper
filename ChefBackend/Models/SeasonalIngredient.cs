using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class SeasonalIngredient
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("ingredient")]
    public string Ingredient { get; set; } = null!;

    [BsonElement("region")]
    public string Region { get; set; } = null!;

    [BsonElement("season")]
    public string Season { get; set; } = null!;

    [BsonElement("localized_name")]
    public string? LocalizedName { get; set; }

    [BsonElement("image_url")]
    public string? ImageUrl { get; set; }

    [BsonElement("available_months")]
    public List<int> AvailableMonths { get; set; } = new();

    [BsonElement("tags")]
    public List<string> Tags { get; set; } = new();

    [BsonElement("nutrition")]
    public NutritionInfo? Nutrition { get; set; }
}

public class NutritionInfo
{
    [BsonElement("calories")]
    public int Calories { get; set; }

    [BsonElement("vitaminC")]
    public string? VitaminC { get; set; }
}
