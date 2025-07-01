using ChefBackend.Models;

using MongoDB.Driver;

namespace ChefBackend.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _users;

        public UserService(DbService dbService)
        {
            _users = dbService.GetCollection<User>("Users");
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            return await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
        }

        public async Task<User> GetByGoogleIdAsync(string googleId)
        {
            return await _users.Find(u => u.GoogleId == googleId).FirstOrDefaultAsync();
        }

        public async Task CreateAsync(User user)
        {
            await _users.InsertOneAsync(user);
        }

        public async Task<User> GetByIdAsync(string id)
        {
            return await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
        }

        public async Task UpdateAsync(string id, User user)
        {
            await _users.ReplaceOneAsync(u => u.Id == id, user);
        }
    }
} 