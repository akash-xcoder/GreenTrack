/**
 * Renewable Energy API Service
 * Tracks solar, wind, and other renewable energy deployment
 * Based on India's renewable energy targets and progress
 */

import { getSolarAndWeatherData, geocodeLocation } from './locationApi';

/**
 * Get location-specific renewable energy potential
 */
export const getLocationRenewablePotential = async (locationName) => {
  try {
    const location = await geocodeLocation(locationName);
    const weatherData = await getSolarAndWeatherData(location.lat, location.lon);

    // Calculate solar potential based on radiation data
    const solarPotential = calculateSolarPotential(weatherData.solar);
    const windPotential = calculateWindPotential(weatherData.current.windSpeed);

    // Get state-specific data
    const stateData = getStateRenewableData(location.state);

    return {
      location: location.displayName,
      state: location.state,
      coordinates: { lat: location.lat, lon: location.lon },
      solar: {
        dailyRadiation: weatherData.solar.avgDailyRadiation,
        currentRadiation: weatherData.solar.currentRadiation,
        potential: solarPotential,
        estimatedOutput: `${solarPotential.dailyKwhPer1kW} kWh per day per 1kW installed`,
        rooftopPotential: solarPotential.rooftopEstimate
      },
      wind: {
        currentSpeed: weatherData.current.windSpeed,
        potential: windPotential,
        suitability: windPotential.suitability
      },
      state: stateData,
      weather: weatherData.current,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching location renewable potential:', error);
    throw error;
  }
};

/**
 * Calculate solar potential based on radiation data
 */
const calculateSolarPotential = (solarData) => {
  const avgRadiation = solarData.avgDailyRadiation;

  // Convert W/m² to kWh per day (assuming standard 1kW system with 15% efficiency)
  const dailyKwhPer1kW = (avgRadiation * 24 * 0.15) / 1000;

  // Estimate annual generation
  const annualKwhPer1kW = dailyKwhPer1kW * 365;

  // Rooftop solar potential (assuming 100 sq meter roof)
  const rooftopEstimate = {
    area: 100, // sq meters
    capacity: 10, // kW (10W per sq ft approximately)
    dailyGeneration: dailyKwhPer1kW * 10,
    annualGeneration: annualKwhPer1kW * 10,
    co2Saved: (annualKwhPer1kW * 10 * 0.63), // kg per year (630g per kWh avg)
    savings: Math.round(annualKwhPer1kW * 10 * 6) // INR at ₹6/kWh
  };

  let category = 'Moderate';
  if (avgRadiation > 600) category = 'Excellent';
  else if (avgRadiation > 450) category = 'Very Good';
  else if (avgRadiation > 300) category = 'Good';
  else if (avgRadiation < 200) category = 'Poor';

  return {
    dailyKwhPer1kW: Math.round(dailyKwhPer1kW * 100) / 100,
    annualKwhPer1kW: Math.round(annualKwhPer1kW),
    category,
    rooftopEstimate
  };
};

/**
 * Calculate wind potential based on wind speed
 */
const calculateWindPotential = (windSpeed) => {
  let suitability = 'Not Suitable';
  let category = 'Poor';
  let estimatedCapacity = 0;

  if (windSpeed > 6) {
    suitability = 'Excellent for Wind Farms';
    category = 'Excellent';
    estimatedCapacity = Math.round(windSpeed * 100); // Simplified estimation
  } else if (windSpeed > 5) {
    suitability = 'Good for Small Wind Turbines';
    category = 'Good';
    estimatedCapacity = Math.round(windSpeed * 80);
  } else if (windSpeed > 4) {
    suitability = 'Moderate - Small Scale Possible';
    category = 'Moderate';
    estimatedCapacity = Math.round(windSpeed * 50);
  } else if (windSpeed > 3) {
    suitability = 'Low - Not Recommended';
    category = 'Low';
    estimatedCapacity = Math.round(windSpeed * 30);
  }

  return {
    windSpeed,
    suitability,
    category,
    estimatedCapacity, // W per turbine
    commercialViability: windSpeed > 5
  };
};

/**
 * Get state-specific renewable energy data
 */
const getStateRenewableData = (stateName) => {
  const stateDataMap = getRenewableEnergyByRegion();
  const stateInfo = stateDataMap.find(s => s.state === stateName);

  if (stateInfo) {
    return stateInfo;
  }

  // Return generic data if state not found
  return {
    state: stateName,
    solar: 0,
    wind: 0,
    total: 0,
    potential: 50000,
    utilizationRate: 0
  };
};

/**
 * Get India's renewable energy overview and targets
 */
export const getRenewableEnergyOverview = () => {
  return {
    currentYear: new Date().getFullYear(),
    totalCapacity: 175000, // MW - Total renewable capacity
    targets: {
      2030: 500000, // 500 GW target by 2030
      2070: 'Net Zero' // Carbon neutrality target
    },
    breakdown: {
      solar: {
        installed: 72000, // MW
        target2030: 280000,
        growth: 18.5 // % year-over-year
      },
      wind: {
        installed: 42000, // MW
        target2030: 140000,
        growth: 12.3
      },
      hydro: {
        installed: 51000, // MW
        target2030: 67000,
        growth: 3.2
      },
      biomass: {
        installed: 10000, // MW
        target2030: 13000,
        growth: 5.1
      }
    },
    progress: {
      percentComplete: 35, // % of 2030 target achieved
      trend: 'improving',
      recentAchievements: [
        'Added 15 GW solar capacity in last year',
        'Wind capacity grew by 2.5 GW',
        'Rural electrification reached 99.9%'
      ]
    }
  };
};

/**
 * Get renewable energy deployment by state/region
 */
export const getRenewableEnergyByRegion = () => {
  const regions = [
    {
      state: 'Rajasthan',
      solar: 17800,
      wind: 4300,
      total: 22100,
      potential: 142000,
      utilizationRate: 15.6
    },
    {
      state: 'Karnataka',
      solar: 7800,
      wind: 6900,
      total: 14700,
      potential: 95000,
      utilizationRate: 15.5
    },
    {
      state: 'Tamil Nadu',
      solar: 5800,
      wind: 10500,
      total: 16300,
      potential: 127000,
      utilizationRate: 12.8
    },
    {
      state: 'Gujarat',
      solar: 10500,
      wind: 9800,
      total: 20300,
      potential: 113000,
      utilizationRate: 18.0
    },
    {
      state: 'Maharashtra',
      solar: 4900,
      wind: 7800,
      total: 12700,
      potential: 98000,
      utilizationRate: 13.0
    },
    {
      state: 'Andhra Pradesh',
      solar: 5600,
      wind: 4100,
      total: 9700,
      potential: 89000,
      utilizationRate: 10.9
    },
    {
      state: 'Telangana',
      solar: 5300,
      wind: 150,
      total: 5450,
      potential: 25000,
      utilizationRate: 21.8
    },
    {
      state: 'Madhya Pradesh',
      solar: 3600,
      wind: 2800,
      total: 6400,
      potential: 78000,
      utilizationRate: 8.2
    }
  ];

  return regions.map(region => ({
    ...region,
    progressToTarget: ((region.total / region.potential) * 100).toFixed(1),
    recentGrowth: (Math.random() * 20 + 5).toFixed(1), // 5-25% growth
    investmentNeeded: Math.floor((region.potential - region.total) * 0.5) // ₹ Crores
  }));
};

/**
 * Get time series data for renewable energy deployment
 */
export const getRenewableEnergyTimeSeries = () => {
  const data = [];
  const startYear = 2015;
  const currentYear = new Date().getFullYear();

  for (let year = startYear; year <= currentYear; year++) {
    const yearsFromStart = year - startYear;

    data.push({
      year,
      solar: Math.floor(15000 + yearsFromStart * 7000 + Math.random() * 2000),
      wind: Math.floor(25000 + yearsFromStart * 2000 + Math.random() * 1000),
      hydro: Math.floor(45000 + yearsFromStart * 800 + Math.random() * 500),
      biomass: Math.floor(8000 + yearsFromStart * 250 + Math.random() * 200),
      total: 0 // Will be calculated
    });

    // Calculate total
    const lastEntry = data[data.length - 1];
    lastEntry.total = lastEntry.solar + lastEntry.wind + lastEntry.hydro + lastEntry.biomass;
  }

  return data;
};

/**
 * Get decentralized renewable energy projects (rural/local)
 */
export const getDecentralizedProjects = () => {
  return [
    {
      id: 1,
      name: 'Solar Rooftop Program - Delhi',
      type: 'Solar',
      capacity: 50, // MW
      location: 'Delhi',
      status: 'Active',
      households: 15000,
      investment: 250, // ₹ Crores
      co2Saved: 45000 // tons/year
    },
    {
      id: 2,
      name: 'Wind Farm - Jaisalmer',
      type: 'Wind',
      capacity: 150,
      location: 'Rajasthan',
      status: 'Active',
      households: 45000,
      investment: 800,
      co2Saved: 180000
    },
    {
      id: 3,
      name: 'Community Solar - Rural Maharashtra',
      type: 'Solar',
      capacity: 25,
      location: 'Maharashtra',
      status: 'Under Construction',
      households: 8000,
      investment: 125,
      co2Saved: 22500
    },
    {
      id: 4,
      name: 'Off-grid Solar - Uttarakhand Villages',
      type: 'Solar',
      capacity: 5,
      location: 'Uttarakhand',
      status: 'Planning',
      households: 2500,
      investment: 40,
      co2Saved: 4500
    },
    {
      id: 5,
      name: 'Hybrid Wind-Solar - Gujarat Coast',
      type: 'Hybrid',
      capacity: 200,
      location: 'Gujarat',
      status: 'Active',
      households: 60000,
      investment: 1200,
      co2Saved: 240000
    }
  ];
};

/**
 * Get financing mechanisms and opportunities
 */
export const getFinancingOptions = () => {
  return [
    {
      scheme: 'PM-KUSUM (Solar Agriculture)',
      provider: 'Government of India',
      subsidy: '60%',
      target: 'Farmers',
      scope: 'Solar pumps and grid-connected solar',
      maxAmount: 15 // Lakhs
    },
    {
      scheme: 'Solar Rooftop Subsidy',
      provider: 'MNRE',
      subsidy: '40% (up to 3kW), 20% (3-10kW)',
      target: 'Residential',
      scope: 'Rooftop solar installations',
      maxAmount: 3
    },
    {
      scheme: 'Green Energy Corridor',
      provider: 'Central Government',
      subsidy: 'Grant support',
      target: 'States',
      scope: 'Grid integration and infrastructure',
      maxAmount: 500 // Crores per state
    },
    {
      scheme: 'IREDA Financing',
      provider: 'Indian Renewable Energy Development Agency',
      subsidy: 'Low-interest loans (8-10%)',
      target: 'Private Sector',
      scope: 'All renewable energy projects',
      maxAmount: 5000
    }
  ];
};

/**
 * Get grid integration challenges and status
 */
export const getGridIntegrationStatus = () => {
  return {
    challenges: [
      {
        issue: 'Storage Capacity',
        severity: 'High',
        currentCapacity: 5000, // MWh
        requiredCapacity: 50000,
        progress: 10
      },
      {
        issue: 'Transmission Infrastructure',
        severity: 'Medium',
        currentCoverage: 65, // %
        targetCoverage: 95,
        progress: 68
      },
      {
        issue: 'Grid Stability',
        severity: 'Medium',
        reliability: 92, // %
        target: 99,
        progress: 93
      },
      {
        issue: 'Smart Metering',
        severity: 'Low',
        deployment: 45, // % of grid
        target: 100,
        progress: 45
      }
    ],
    solutions: [
      'Battery storage systems deployment',
      'Upgrading transmission lines',
      'AI-based demand forecasting',
      'Pumped hydro storage projects'
    ]
  };
};

/**
 * Get real-time generation data (simulated)
 */
export const getRealTimeGeneration = () => {
  const hour = new Date().getHours();

  // Solar peaks during day
  const solarMultiplier = hour >= 6 && hour <= 18
    ? Math.sin(((hour - 6) / 12) * Math.PI)
    : 0;

  // Wind varies throughout day
  const windMultiplier = 0.5 + Math.random() * 0.5;

  return {
    timestamp: new Date().toISOString(),
    solar: Math.floor(72000 * solarMultiplier * 0.8), // MW current generation
    wind: Math.floor(42000 * windMultiplier * 0.7),
    hydro: Math.floor(51000 * 0.6),
    biomass: Math.floor(10000 * 0.75),
    total: 0, // Will be calculated
    gridLoad: Math.floor(150000 + Math.random() * 50000),
    renewablePercentage: 0 // Will be calculated
  };
};

/**
 * Calculate targets progress
 */
export const calculateTargetProgress = () => {
  const overview = getRenewableEnergyOverview();
  const current = overview.totalCapacity;
  const target = overview.targets[2030];

  const yearsLeft = 2030 - new Date().getFullYear();
  const required = target - current;
  const annualRequired = required / yearsLeft;

  return {
    currentCapacity: current,
    targetCapacity: target,
    achieved: ((current / target) * 100).toFixed(1),
    remaining: required,
    yearsLeft,
    annualRequirement: Math.floor(annualRequired),
    onTrack: annualRequired < 35000 // Realistic annual addition
  };
};
