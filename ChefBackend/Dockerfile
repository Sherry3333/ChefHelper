# build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY *.csproj ./
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /publish

# running stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Set environment variables for Render
ENV ASPNETCORE_URLS=http://+:${PORT}
ENV ASPNETCORE_ENVIRONMENT=Production

# Copy published files
COPY --from=build /publish .

# Expose port (Render will handle port mapping)
EXPOSE ${PORT}

ENTRYPOINT ["dotnet", "ChefBackend.dll"]
