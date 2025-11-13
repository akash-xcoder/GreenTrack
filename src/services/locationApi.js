/**
 * Location-based API Service
 * Handles geocoding and location-based data fetching
 * Uses free APIs with no API key requirements
 */

/**
 * Get coordinates from location name using Nominatim (OpenStreetMap)
 * Completely free, no API key needed
 */
export const geocodeLocation = async (locationName) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)},India&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'GreenTrack-India-Platform'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();

    if (data.length === 0) {
      throw new Error('Location not found');
    }

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      displayName: data[0].display_name,
      state: extractState(data[0].display_name)
    };
  } catch (error) {
    console.error('Error geocoding location:', error);
    throw error;
  }
};

/**
 * Extract state name from display name
 */
const extractState = (displayName) => {
  const stateMap = {
    'Delhi': 'Delhi',
    'New Delhi': 'Delhi',
    'Mumbai': 'Maharashtra',
    'Bombay': 'Maharashtra',
    'Bangalore': 'Karnataka',
    'Bengaluru': 'Karnataka',
    'Chennai': 'Tamil Nadu',
    'Madras': 'Tamil Nadu',
    'Kolkata': 'West Bengal',
    'Calcutta': 'West Bengal',
    'Hyderabad': 'Telangana',
    'Pune': 'Maharashtra',
    'Ahmedabad': 'Gujarat',
    'Jaipur': 'Rajasthan',
    'Lucknow': 'Uttar Pradesh',
    'Surat': 'Gujarat',
    'Kanpur': 'Uttar Pradesh',
    'Nagpur': 'Maharashtra',
    'Indore': 'Madhya Pradesh',
    'Bhopal': 'Madhya Pradesh',
    'Visakhapatnam': 'Andhra Pradesh',
    'Vizag': 'Andhra Pradesh',
    'Vadodara': 'Gujarat',
    'Baroda': 'Gujarat',
    'Coimbatore': 'Tamil Nadu',
    'Kochi': 'Kerala',
    'Cochin': 'Kerala',
    'Thiruvananthapuram': 'Kerala',
    'Trivandrum': 'Kerala',
    'Patna': 'Bihar',
    'Ranchi': 'Jharkhand',
    'Bhubaneswar': 'Odisha',
    'Chandigarh': 'Punjab',
    'Ludhiana': 'Punjab',
    'Amritsar': 'Punjab',
    'Gurgaon': 'Haryana',
    'Gurugram': 'Haryana',
    'Noida': 'Uttar Pradesh',
    'Ghaziabad': 'Uttar Pradesh',
    'Agra': 'Uttar Pradesh',
    'Varanasi': 'Uttar Pradesh',
    'Meerut': 'Uttar Pradesh',
    'Dehradun': 'Uttarakhand',
    'Shimla': 'Himachal Pradesh',
    'Panaji': 'Goa',
    'Srinagar': 'Jammu and Kashmir',
    'Jammu': 'Jammu and Kashmir',
    'Raipur': 'Chhattisgarh',
    'Guwahati': 'Assam',
    'Imphal': 'Manipur',
    'Shillong': 'Meghalaya',
    'Aizawl': 'Mizoram',
    'Gangtok': 'Sikkim'
  };

  // Try to match known cities first (case-insensitive)
  const displayLower = displayName.toLowerCase();
  for (const [city, state] of Object.entries(stateMap)) {
    if (displayLower.includes(city.toLowerCase())) {
      return state;
    }
  }

  // Try to extract state from display name
  const parts = displayName.split(',').map(p => p.trim());
  const indianStates = [
    'Maharashtra', 'Tamil Nadu', 'Gujarat', 'Karnataka', 'Rajasthan',
    'Andhra Pradesh', 'Telangana', 'Madhya Pradesh', 'Uttar Pradesh',
    'West Bengal', 'Kerala', 'Bihar', 'Odisha', 'Punjab', 'Haryana',
    'Jharkhand', 'Chhattisgarh', 'Assam', 'Delhi', 'Uttarakhand',
    'Himachal Pradesh', 'Goa', 'Manipur', 'Meghalaya', 'Tripura',
    'Nagaland', 'Arunachal Pradesh', 'Mizoram', 'Sikkim', 'Jammu and Kashmir',
    'National Capital Territory of Delhi'
  ];

  for (const part of parts) {
    // Check for exact match
    if (indianStates.includes(part)) {
      if (part === 'National Capital Territory of Delhi') {
        return 'Delhi';
      }
      return part;
    }
    // Check for partial match (case-insensitive)
    for (const state of indianStates) {
      if (part.toLowerCase().includes(state.toLowerCase()) || state.toLowerCase().includes(part.toLowerCase())) {
        if (state === 'National Capital Territory of Delhi') {
          return 'Delhi';
        }
        return state;
      }
    }
  }

  return 'Unknown';
};

/**
 * Get solar radiation and weather data using Open-Meteo API
 * Completely free, no API key needed
 */
export const getSolarAndWeatherData = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,cloud_cover,wind_speed_10m&hourly=shortwave_radiation,direct_radiation,diffuse_radiation&timezone=Asia/Kolkata`
    );

    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }

    const data = await response.json();

    return {
      current: {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        pressure: data.current.surface_pressure,
        cloudCover: data.current.cloud_cover,
        windSpeed: data.current.wind_speed_10m
      },
      solar: {
        // Current hour solar radiation
        currentRadiation: data.hourly.shortwave_radiation[new Date().getHours()],
        directRadiation: data.hourly.direct_radiation[new Date().getHours()],
        diffuseRadiation: data.hourly.diffuse_radiation[new Date().getHours()],
        // Calculate daily average
        avgDailyRadiation: calculateAverage(data.hourly.shortwave_radiation.slice(0, 24))
      }
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return fallback data
    return {
      current: {
        temperature: 28,
        humidity: 65,
        pressure: 1013,
        cloudCover: 30,
        windSpeed: 12
      },
      solar: {
        currentRadiation: 400,
        directRadiation: 300,
        diffuseRadiation: 100,
        avgDailyRadiation: 350
      }
    };
  }
};

/**
 * Get air quality data using Open-Meteo Air Quality API
 * Free, no API key needed
 */
export const getAirQualityData = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=Asia/Kolkata`
    );

    if (!response.ok) {
      throw new Error('Air quality data fetch failed');
    }

    const data = await response.json();

    return {
      pm10: data.current.pm10,
      pm25: data.current.pm2_5,
      co: data.current.carbon_monoxide,
      no2: data.current.nitrogen_dioxide,
      so2: data.current.sulphur_dioxide,
      o3: data.current.ozone,
      // Calculate Air Quality Index (simplified)
      aqi: calculateAQI(data.current)
    };
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    return null;
  }
};

/**
 * Calculate simplified Air Quality Index
 */
const calculateAQI = (airQuality) => {
  // Simplified AQI calculation based on PM2.5
  const pm25 = airQuality.pm2_5;

  if (pm25 <= 12) return { value: 'Good', level: 1, color: 'green' };
  if (pm25 <= 35.4) return { value: 'Moderate', level: 2, color: 'yellow' };
  if (pm25 <= 55.4) return { value: 'Unhealthy for Sensitive Groups', level: 3, color: 'orange' };
  if (pm25 <= 150.4) return { value: 'Unhealthy', level: 4, color: 'red' };
  if (pm25 <= 250.4) return { value: 'Very Unhealthy', level: 5, color: 'purple' };
  return { value: 'Hazardous', level: 6, color: 'maroon' };
};

/**
 * Helper function to calculate average
 */
const calculateAverage = (arr) => {
  const sum = arr.reduce((a, b) => a + b, 0);
  return Math.round(sum / arr.length);
};

/**
 * Get comprehensive location data
 */
export const getLocationData = async (locationName) => {
  try {
    // First geocode the location
    const location = await geocodeLocation(locationName);

    // Then fetch weather and solar data
    const weatherData = await getSolarAndWeatherData(location.lat, location.lon);

    // Fetch air quality data
    const airQualityData = await getAirQualityData(location.lat, location.lon);

    return {
      location,
      weather: weatherData,
      airQuality: airQualityData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching location data:', error);
    throw error;
  }
};
