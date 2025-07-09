using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ChefBackend.Models
{
    public class Vote
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("userId")]
        public string UserId { get; set; }

        [BsonElement("RecipeId")]
        public int RecipeId { get; set; }
    }
} 