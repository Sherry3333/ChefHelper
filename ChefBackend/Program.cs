using DotNetEnv;
using ChefBackend.Services;

var builder = WebApplication.CreateBuilder(args);

//read .env file
DotNetEnv.Env.Load();
//register Controller routes
builder.Services.AddControllers();
//add mongodb service
builder.Services.AddSingleton<DbService>();
builder.Services.AddScoped<RecipeService>();
builder.Services.AddScoped<SeasonalIngredientService>();
builder.Services.AddScoped<SeasonalIngredientInitializer>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<SpoonacularService>();
builder.Services.AddMemoryCache();

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()   
                        .AllowAnyMethod()   
                        .AllowAnyHeader()); 
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// add CORS before UseAuthorization
app.UseCors("AllowAll");

// Initialize seasonal ingredients if needed
using (var scope = app.Services.CreateScope())
{
    var initializer = scope.ServiceProvider.GetRequiredService<SeasonalIngredientInitializer>();
    string jsonPath = Path.Combine(AppContext.BaseDirectory, "seasonal_ingredients.json");
    await initializer.InitializeAsync(jsonPath);
}

app.MapControllers(); //make sure Api controllers are mapped

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
