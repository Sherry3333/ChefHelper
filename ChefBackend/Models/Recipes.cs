
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Recipe{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = null!;

    [BsonElement("ingredients")]
    public string Ingredients { get; set; } = null!;

    [BsonElement("content")]
    public string Content { get; set; } = null!;
}