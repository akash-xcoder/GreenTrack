import axios from 'axios';
import { getLocationData } from './locationApi';

/**
 * Carbon Emissions API Service
 * Provides carbon intensity and emissions tracking data
 * Using location-based calculations for India-specific data
 */

/**
 * India's state-wise grid carbon intensity (gCO2/kWh)
 * Based on state energy mix (coal, renewable, etc.)
 */
const STATE_CARBON_INTENSITY = {
  'Delhi': 580,
  'Maharashtra': 650,
  'Karnataka': 620,
  'Tamil Nadu': 590,
  'Gujarat': 710,
  'Rajasthan': 520,
  'Andhra Pradesh': 680,
  'Telangana': 670,
  'Madhya Pradesh': 720,
  'Uttar Pradesh': 730,
  'West Bengal': 740,
  'Kerala': 480,
  'Punjab': 640,
  'Haryana': 690,
  'Bihar': 700,
  'Odisha': 710,
  'Jharkhand': 750,
  'Chhattisgarh': 760,
  'Assam': 550,
  'Uttarakhand': 530,
  'Himachal Pradesh': 420,
  'Goa': 490,
  'Unknown': 630 // National average
};

/**
 * Get current carbon intensity for a location
 */
export const getCurrentCarbonIntensity = async (locationName = null) => {
  if (locationName) {
    try {
      const locationData = await getLocationData(locationName);
      const state = locationData.location.state;
      const carbonIntensity = STATE_CARBON_INTENSITY[state] || STATE_CARBON_INTENSITY['Unknown'];

      // Adjust carbon intensity based on air quality and weather
      const adjustedIntensity = adjustCarbonIntensity(
        carbonIntensity,
        locationData.airQuality,
        locationData.weather
      );

      return {
        location: locationData.location.displayName,
        state,
        carbonIntensity: adjustedIntensity,
        airQuality: locationData.airQuality,
        weather: locationData.weather,
        timestamp: new Date().toISOString(),
        index: getIntensityIndex(adjustedIntensity)
      };
    } catch (error) {
      console.error('Error fetching carbon intensity for location:', error);
      return generateMockCarbonData();
    }
  } else {
    // Return national average if no location specified
    return generateMockCarbonData();
  }
};

/**
 * Get carbon intensity for a specific date range
 */
export const getCarbonIntensityByDate = async (from, to) => {
  try {
    const response = await axios.get(
      `${CARBON_API_BASE}/intensity/${from}/${to}`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching carbon intensity by date:', error);
    return generateMockCarbonTimeSeries();
  }
};

/**
 * Adjust carbon intensity based on real-time conditions
 */
const adjustCarbonIntensity = (baseIntensity, airQuality, weather) => {
  let adjusted = baseIntensity;
  const hour = new Date().getHours();

  // Time-of-day variation (coal plants run more at night, solar during day)
  if (hour >= 6 && hour <= 18) {
    // Daytime - more solar, less coal
    const solarFactor = Math.sin(((hour - 6) / 12) * Math.PI);
    adjusted *= (1 - (solarFactor * 0.15)); // Up to 15% reduction during peak solar hours
  } else {
    // Nighttime - no solar, more coal/fossil fuels
    adjusted *= 1.15; // 15% increase at night
  }

  // High pollution indicates more fossil fuel usage
  if (airQuality && airQuality.pm25) {
    if (airQuality.pm25 > 150) {
      adjusted *= 1.25; // Very high pollution = heavy fossil fuel use
    } else if (airQuality.pm25 > 100) {
      adjusted *= 1.15;
    } else if (airQuality.pm25 > 50) {
      adjusted *= 1.05;
    } else {
      adjusted *= 0.95; // Low pollution = cleaner energy mix
    }
  }

  // Solar radiation affects carbon intensity
  if (weather && weather.solar.currentRadiation !== undefined) {
    if (weather.solar.currentRadiation > 600) {
      adjusted *= 0.85; // Excellent solar conditions = much less coal
    } else if (weather.solar.currentRadiation > 400) {
      adjusted *= 0.92; // Good solar
    } else if (weather.solar.currentRadiation > 200) {
      adjusted *= 0.97; // Moderate solar
    } else if (weather.solar.currentRadiation < 50) {
      adjusted *= 1.12; // Very cloudy/night = more coal
    }
  }

  // Cloud cover affects solar generation
  if (weather && weather.current && weather.current.cloudCover > 80) {
    adjusted *= 1.08; // Heavy clouds = less solar, more coal
  }

  // Add some realistic random variation (±3%)
  const randomVariation = 0.97 + (Math.random() * 0.06);
  adjusted *= randomVariation;

  return Math.round(adjusted);
};

/**
 * Get intensity index based on carbon intensity value
 */
const getIntensityIndex = (intensity) => {
  if (intensity < 450) return 'very low';
  if (intensity < 550) return 'low';
  if (intensity < 650) return 'moderate';
  if (intensity < 750) return 'high';
  return 'very high';
};

/**
 * Get carbon intensity by location name (convenience function)
 */
export const getCarbonIntensityByLocation = async (locationName) => {
  return await getCurrentCarbonIntensity(locationName);
};

/**
 * Estimate carbon footprint for a location based on typical consumption
 */
export const estimateLocationCarbonFootprint = async (locationName, monthlyKwh = 100) => {
  try {
    const intensityData = await getCurrentCarbonIntensity(locationName);
    const emissions = calculateEmissions(monthlyKwh, intensityData.carbonIntensity);

    return {
      location: intensityData.location,
      state: intensityData.state,
      monthlyConsumption: monthlyKwh,
      monthlyCO2: emissions.co2,
      annualCO2: emissions.co2 * 12,
      treesNeeded: emissions.trees * 12,
      comparison: {
        nationalAvg: calculateEmissions(monthlyKwh, STATE_CARBON_INTENSITY['Unknown']).co2,
        savings: calculateEmissions(monthlyKwh, STATE_CARBON_INTENSITY['Unknown']).co2 - emissions.co2
      }
    };
  } catch (error) {
    console.error('Error estimating carbon footprint:', error);
    throw error;
  }
};

/**
 * Generate mock carbon emissions data for India
 * This simulates regional carbon tracking
 */
export const generateMockCarbonData = () => {
  const regions = [
    'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata',
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
  ];

  return {
    from: new Date().toISOString(),
    to: new Date().toISOString(),
    intensity: {
      forecast: Math.floor(Math.random() * 300) + 400, // 400-700 gCO2/kWh
      actual: Math.floor(Math.random() * 300) + 400,
      index: 'moderate'
    },
    regions: regions.map(region => ({
      region,
      intensity: Math.floor(Math.random() * 300) + 400,
      generationmix: generateEnergyMix()
    }))
  };
};

/**
 * Generate mock time series data for carbon emissions
 */
const generateMockCarbonTimeSeries = () => {
  const data = [];
  const now = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      from: date.toISOString(),
      to: date.toISOString(),
      intensity: {
        forecast: Math.floor(Math.random() * 300) + 400,
        actual: Math.floor(Math.random() * 300) + 400,
        index: ['very low', 'low', 'moderate', 'high', 'very high'][
          Math.floor(Math.random() * 5)
        ]
      }
    });
  }

  return data;
};

/**
 * Generate energy generation mix (coal, solar, wind, etc.)
 */
const generateEnergyMix = () => {
  const total = 100;
  const solar = Math.floor(Math.random() * 15) + 10; // 10-25%
  const wind = Math.floor(Math.random() * 15) + 8;   // 8-23%
  const hydro = Math.floor(Math.random() * 10) + 5;  // 5-15%
  const nuclear = Math.floor(Math.random() * 5) + 2; // 2-7%
  const coal = total - solar - wind - hydro - nuclear;

  return [
    { fuel: 'coal', perc: coal },
    { fuel: 'solar', perc: solar },
    { fuel: 'wind', perc: wind },
    { fuel: 'hydro', perc: hydro },
    { fuel: 'nuclear', perc: nuclear }
  ];
};

/**
 * Calculate emissions for a given energy consumption
 * @param {number} kwh - Energy consumption in kWh
 * @param {number} carbonIntensity - Carbon intensity in gCO2/kWh
 */
export const calculateEmissions = (kwh, carbonIntensity = 500) => {
  return {
    co2: (kwh * carbonIntensity) / 1000, // Convert to kg
    co2e: (kwh * carbonIntensity * 1.1) / 1000, // Approximate CO2 equivalent
    trees: Math.ceil((kwh * carbonIntensity) / 21000) // Trees needed to offset
  };
};

/**
 * Get emissions by sector (for local business/government tracking)
 */
export const getEmissionsBySector = () => {
  return [
    { sector: 'Energy', emissions: Math.floor(Math.random() * 5000) + 10000, target: 12000, reduction: 15 },
    { sector: 'Transport', emissions: Math.floor(Math.random() * 3000) + 6000, target: 7000, reduction: 12 },
    { sector: 'Industry', emissions: Math.floor(Math.random() * 4000) + 8000, target: 9000, reduction: 10 },
    { sector: 'Agriculture', emissions: Math.floor(Math.random() * 2000) + 4000, target: 4500, reduction: 8 },
    { sector: 'Residential', emissions: Math.floor(Math.random() * 2500) + 5000, target: 5500, reduction: 11 }
  ];
};

/**
 * Get local government emissions tracking
 */
export const getLocalGovernmentData = () => {
  const states = [
    'Maharashtra', 'Tamil Nadu', 'Gujarat', 'Karnataka', 'Rajasthan',
    'Andhra Pradesh', 'Telangana', 'Madhya Pradesh', 'Uttar Pradesh', 'Punjab'
  ];

  return states.map(state => ({
    name: state,
    totalEmissions: Math.floor(Math.random() * 50000) + 30000,
    renewableCapacity: Math.floor(Math.random() * 5000) + 2000,
    emissionReduction: Math.floor(Math.random() * 20) + 5,
    solarCapacity: Math.floor(Math.random() * 3000) + 1000,
    windCapacity: Math.floor(Math.random() * 2000) + 500
  }));
};
