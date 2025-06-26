// Geolocation service to get user's current coordinates
// Returns a Promise that resolves to { latitude, longitude }

// Default to Auckland, New Zealand if geolocation is not supported
const DEFAULT_LOCATION = {
  latitude: -36.8485,
  longitude: 174.7633,
  accuracy: null,
  timestamp: Date.now(),
  isDefault: true
};

class GeolocationService {
  // Get current position using browser Geolocation API
  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        // Return default location for New Zealand
        resolve(DEFAULT_LOCATION);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
            isDefault: false
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            // User denied geolocation, use default location
            resolve(DEFAULT_LOCATION);
          } else {
            let errorMessage = '';
            switch (error.code) {
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable.';
                break;
              case error.TIMEOUT:
                errorMessage = 'The request to get user location timed out.';
                break;
              default:
                errorMessage = 'An unknown error occurred while getting location.';
                break;
            }
            reject(new Error(errorMessage));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // Accept cached position up to 5 minutes old
        }
      );
    });
  }
}

// Export a singleton instance
const geolocationService = new GeolocationService();
export default geolocationService; 