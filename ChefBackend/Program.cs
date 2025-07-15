using DotNetEnv;
using ChefBackend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;

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
builder.Services.AddScoped<SeasonalRecipeCacheService>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<SpoonacularService>();
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<UserService>();
builder.Services.AddScoped<FavoriteService>();
builder.Services.AddScoped<VoteService>();
builder.Services.AddScoped<CloudinaryService>();

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ChefBackend API", Version = "v1" });

    // support JWT token
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()   
                        .AllowAnyMethod()   
                        .AllowAnyHeader()); 
});

var jwtKey = Environment.GetEnvironmentVariable("JWT__KEY");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT__ISSUER");
var jwtAudience = Environment.GetEnvironmentVariable("JWT__AUDIENCE");



builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
    
    
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
    
    // Create database indexes
    var dbService = scope.ServiceProvider.GetRequiredService<DbService>();
    await dbService.CreateIndexesAsync();
}


app.UseAuthentication();
app.UseAuthorization();

app.MapControllers(); //make sure Api controllers are mapped
app.Run();


