using System;

// Static class for season logic
public static class SeasonalConfig
{
    /// <summary>
    /// Get the current season based on latitude, longitude, and date.
    /// Returns: "Spring", "Summer", "Autumn", or "Winter" (English)
    /// </summary>
    public static string GetCurrentSeason(double latitude, double longitude, DateTime? date = null)
    {
        var now = date ?? DateTime.UtcNow;
        int month = now.Month;
        bool isSouthernHemisphere = latitude < 0;

        // Northern Hemisphere
        if (!isSouthernHemisphere)
        {
            if (month >= 3 && month <= 5) return "Spring";
            if (month >= 6 && month <= 8) return "Summer";
            if (month >= 9 && month <= 11) return "Autumn";
            return "Winter"; // Dec, Jan, Feb
        }
        // Southern Hemisphere
        else
        {
            if (month >= 3 && month <= 5) return "Autumn";
            if (month >= 6 && month <= 8) return "Winter";
            if (month >= 9 && month <= 11) return "Spring";
            return "Summer"; // Dec, Jan, Feb
        }
    }

    /// <summary>
    /// Get a description for the given season.
    /// </summary>
    public static string GetSeasonDescription(string season)
    {
        switch (season)
        {
            case "Spring": return "Fresh ingredients and vibrant recipes for the spring season.";
            case "Summer": return "Light and refreshing dishes perfect for summer.";
            case "Autumn": return "Hearty and warm recipes for autumn.";
            case "Winter": return "Comforting meals for the winter season.";
            default: return "Seasonal recipes.";
        }
    }
} 