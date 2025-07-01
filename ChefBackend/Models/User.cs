using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace ChefBackend.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("passwordHash")]
        public string? PasswordHash { get; set; }

        [BsonElement("googleId")]
        public string? GoogleId { get; set; }

        [BsonElement("favorites")]
        public List<string> Favorites { get; set; } = new List<string>();
    }
} 