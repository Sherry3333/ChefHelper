using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Recipe{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }

    [BsonElement("spoonacularId")]
    public int SpoonacularId { get; set; }

    [BsonElement("title")]
    public string Title { get; set; }

    [BsonElement("image")]
    public string Image { get; set; }

    [BsonElement("summary")]
    public string Summary { get; set; }

    [BsonElement("instructions")]
    public string Instructions { get; set; }

    [BsonElement("ingredients")]
    public List<string> Ingredients { get; set; }

    [BsonElement("readyInMinutes")]
    public int ReadyInMinutes { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }
}