# ChefBackend

  

A C# backend project for managing recipes, built with ASP.NET Core and MongoDB.

  

## Project Structure

  

ChefBackend/ # Root folder for the backend project

├── ChefBackend.sln # Visual Studio solution file

├── ChefBackend.csproj # C# project file

├── Program.cs # Application entry point (contains the Main method)

├── Controllers/ # API controllers (handle HTTP requests)

│ └── RecipeController.cs # Controller for managing recipe-related endpoints

├── Models/ # Data models (represent business entities)

│ ├── MongoDbSettings.cs # Configuration settings for MongoDB connection

│ └── Recipes.cs # Data model for recipes

├── Properties/ # Project properties and configuration files

│ └── launchSettings.json # Debug and launch configurations for development

├── Services/ # Business logic and service classes

│ └── DbService.cs # Service for database operations and data access

├── appsettings.json # Main application configuration file

└── appsettings.Development.json # Development-specific configuration settings

  

## Getting Started

  

### Prerequisites

  
- [Visual Studio Code](https://code.visualstudio.com/) or another IDE for editing C# code
- add C# Dev Kit Extension if you use VS Code
- [.NET SDK](https://dotnet.microsoft.com/download)
- [MongoDB](https://www.mongodb.com/try/download/community)



  

### Installation

1.  ****Clone the Repository on your local machine****
2.  ****Restore Dependencies****
     > dotnet restore
3.  ****Updete the MongoDB connection string in .env file****
4.  ****Start the project****
     > dotnet watch run
 

# ChefFrontend

### Installation
1.  ****Clone the Repository on your local machine****
2.  ****Restore Dependencies****
     > npm install
3.  ****Updete the backend connection string in recipesServices.js file under hooks folder****
4.  ****Start the project****
     > npm run dev