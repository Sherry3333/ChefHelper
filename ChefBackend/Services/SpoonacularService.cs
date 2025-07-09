using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace ChefBackend.Services
{
    // Custom exception for Spoonacular quota/payment errors
    public class SpoonacularQuotaException : Exception
    {
        public SpoonacularQuotaException(string message) : base(message) { }
    }

    // DTO for Spoonacular recipe result (simplified)
    public class SpoonacularRecipeResult
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Image { get; set; }
        public int Likes { get; set; }
    }

    // DTO for Spoonacular recipe detail
    public class SpoonacularRecipeDetail
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Image { get; set; }
        public List<ExtendedIngredient> ExtendedIngredients { get; set; }
        public string Instructions { get; set; }
    }

    public class ExtendedIngredient
    {
        public int Id { get; set; }
        public string Original { get; set; }
    }

    // Service for calling Spoonacular API
    public class SpoonacularService
    {
        private readonly HttpClient _httpClient;
        private readonly string? _apiKey;

        public SpoonacularService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClient = httpClientFactory.CreateClient();
            _apiKey = configuration["Spoonacular:ApiKey"] ?? Environment.GetEnvironmentVariable("SPOONACULAR_API_KEY");
            if (string.IsNullOrEmpty(_apiKey))
            {
                throw new InvalidOperationException("Spoonacular API key is not set in configuration or environment variable.");
            }
        }

        // Find recipes by ingredients
        public async Task<List<SpoonacularRecipeResult>> FindRecipesByIngredientsAsync(List<string> ingredients, int count = 10)
        {
            var ingredientsString = string.Join(",", ingredients);
            var url = $"https://api.spoonacular.com/recipes/findByIngredients?ingredients={ingredientsString}&number={count}&apiKey={_apiKey}";
            var response = await _httpClient.GetAsync(url);
            if ((int)response.StatusCode == 402)
            {
                throw new SpoonacularQuotaException("Spoonacular API quota exceeded or payment required (402). Please check your API key or upgrade your plan.");
            }
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<SpoonacularRecipeResult>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<SpoonacularRecipeResult>();
        }

        public async Task<List<SpoonacularRecipeResult>> FindRecipesByIngredientsAsync(string ingredientsString, int count)
        {
            var url = $"https://api.spoonacular.com/recipes/findByIngredients?ingredients={ingredientsString}&ranking=2&ignorePantry=true&number={count}&apiKey={_apiKey}";
            var response = await _httpClient.GetAsync(url);
            if ((int)response.StatusCode == 402)
            {
                throw new SpoonacularQuotaException("Spoonacular API quota exceeded or payment required (402). Please check your API key or upgrade your plan.");
            }
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<SpoonacularRecipeResult>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<SpoonacularRecipeResult>();
        }

        // Get recipe detail
        public async Task<SpoonacularRecipeDetail> GetRecipeDetailAsync(int id)
        {
            var url = $"https://api.spoonacular.com/recipes/{id}/information?apiKey={_apiKey}";
            var response = await _httpClient.GetAsync(url);
            if ((int)response.StatusCode == 402)
            {
                throw new SpoonacularQuotaException("Spoonacular API quota exceeded or payment required (402). Please check your API key or upgrade your plan.");
            }
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<SpoonacularRecipeDetail>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }

        // Search recipes by query
        public async Task<List<SpoonacularRecipeResult>> SearchRecipesAsync(string query, int count = 10)
        {
            var encodedQuery = Uri.EscapeDataString(query);
            var url = $"https://api.spoonacular.com/recipes/complexSearch?query={encodedQuery}&number={count}&apiKey={_apiKey}";
            var response = await _httpClient.GetAsync(url);
            if ((int)response.StatusCode == 402)
            {
                throw new SpoonacularQuotaException("Spoonacular API quota exceeded or payment required (402). Please check your API key or upgrade your plan.");
            }
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            
            // Parse the JSON response manually to extract the results array
            using var document = JsonDocument.Parse(json);
            if (document.RootElement.TryGetProperty("results", out var resultsElement))
            {
                return JsonSerializer.Deserialize<List<SpoonacularRecipeResult>>(resultsElement.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<SpoonacularRecipeResult>();
            }
            
            return new List<SpoonacularRecipeResult>();
        }
    }
} 