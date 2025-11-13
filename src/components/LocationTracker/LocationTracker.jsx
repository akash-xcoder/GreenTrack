import React, { useState } from 'react';
import { MapPin, Search, Loader2, Sun, Wind, Leaf, AlertCircle, Zap, TrendingUp } from 'lucide-react';
import {
  getCarbonIntensityByLocation,
  estimateLocationCarbonFootprint
} from '../../services/carbonApi';
import { getLocationRenewablePotential } from '../../services/renewableEnergyApi';
import './LocationTracker.css';

const LocationTracker = () => {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [monthlyKwh, setMonthlyKwh] = useState(100);

  const [carbonData, setCarbonData] = useState(null);
  const [renewableData, setRenewableData] = useState(null);
  const [footprintData, setFootprintData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [carbon, renewable, footprint] = await Promise.all([
        getCarbonIntensityByLocation(location),
        getLocationRenewablePotential(location),
        estimateLocationCarbonFootprint(location, monthlyKwh)
      ]);

      setCarbonData(carbon);
      setRenewableData(renewable);
      setFootprintData(footprint);
    } catch (err) {
      setError(`Could not fetch data for "${location}". Please try another location in India.`);
      console.error('Error fetching location data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (index) => {
    const colors = {
      'very low': '#10b981',
      'low': '#84cc16',
      'moderate': '#eab308',
      'high': '#f97316',
      'very high': '#ef4444'
    };
    return colors[index] || '#6b7280';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Excellent': '#10b981',
      'Very Good': '#84cc16',
      'Good': '#22c55e',
      'Moderate': '#eab308',
      'Poor': '#f97316'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="location-tracker">
      <div className="tracker-header">
        <MapPin className="header-icon" />
        <h1>Location-Based Carbon & Energy Tracker</h1>
        <p>Enter your city or area to get carbon emissions and renewable energy potential data</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-container">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your location (e.g., Mumbai, Bangalore, Jaipur)"
            className="location-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="search-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="spinner" />
                Searching...
              </>
            ) : (
              <>
                <Search size={20} />
                Search
              </>
            )}
          </button>
        </div>

        <div className="consumption-input">
          <label htmlFor="kwh">Monthly Electricity Consumption (kWh):</label>
          <input
            id="kwh"
            type="number"
            value={monthlyKwh}
            onChange={(e) => setMonthlyKwh(Number(e.target.value))}
            min="1"
            max="10000"
            className="kwh-input"
          />
        </div>
      </form>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {carbonData && renewableData && footprintData && (
        <div className="results">
          {/* Location Header */}
          <div className="location-header">
            <h2>{carbonData.location}</h2>
            <span className="state-badge">{carbonData.state}</span>
          </div>

          {/* Carbon Intensity Section */}
          <div className="section carbon-section">
            <div className="section-header">
              <Leaf className="section-icon" />
              <h3>Carbon Intensity</h3>
            </div>

            <div className="intensity-card">
              <div className="intensity-value" style={{ color: getIntensityColor(carbonData.index) }}>
                {carbonData.carbonIntensity}
                <span className="unit">gCO₂/kWh</span>
              </div>
              <div className="intensity-badge" style={{ backgroundColor: getIntensityColor(carbonData.index) }}>
                {carbonData.index.toUpperCase()}
              </div>
            </div>

            {carbonData.airQuality && (
              <div className="air-quality">
                <h4>Air Quality</h4>
                <div className="aqi-info">
                  <div className="aqi-badge" style={{ backgroundColor: carbonData.airQuality.aqi.color }}>
                    {carbonData.airQuality.aqi.value}
                  </div>
                  <div className="pollutants">
                    <div className="pollutant">
                      <span>PM2.5:</span>
                      <strong>{Math.round(carbonData.airQuality.pm25)} µg/m³</strong>
                    </div>
                    <div className="pollutant">
                      <span>PM10:</span>
                      <strong>{Math.round(carbonData.airQuality.pm10)} µg/m³</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Your Carbon Footprint Section */}
          <div className="section footprint-section">
            <div className="section-header">
              <TrendingUp className="section-icon" />
              <h3>Your Carbon Footprint</h3>
            </div>

            <div className="footprint-grid">
              <div className="footprint-card">
                <span className="label">Monthly Emissions</span>
                <span className="value">{footprintData.monthlyCO2.toFixed(2)} kg CO₂</span>
              </div>
              <div className="footprint-card">
                <span className="label">Annual Emissions</span>
                <span className="value">{footprintData.annualCO2.toFixed(2)} kg CO₂</span>
              </div>
              <div className="footprint-card">
                <span className="label">Trees Needed to Offset</span>
                <span className="value">{footprintData.treesNeeded} trees/year</span>
              </div>
              <div className="footprint-card comparison">
                <span className="label">vs National Average</span>
                <span className={`value ${footprintData.comparison.savings > 0 ? 'positive' : 'negative'}`}>
                  {footprintData.comparison.savings > 0 ? '↓' : '↑'}
                  {Math.abs(footprintData.comparison.savings).toFixed(2)} kg CO₂/month
                </span>
              </div>
            </div>
          </div>

          {/* Solar Potential Section */}
          <div className="section solar-section">
            <div className="section-header">
              <Sun className="section-icon" />
              <h3>Solar Energy Potential</h3>
            </div>

            <div className="solar-info">
              <div className="solar-category" style={{ backgroundColor: getCategoryColor(renewableData.solar.potential.category) }}>
                {renewableData.solar.potential.category}
              </div>

              <div className="solar-metrics">
                <div className="metric">
                  <span className="metric-label">Current Solar Radiation</span>
                  <span className="metric-value">{renewableData.solar.currentRadiation} W/m²</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Daily Average</span>
                  <span className="metric-value">{renewableData.solar.dailyRadiation} W/m²</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Daily Output (per 1kW)</span>
                  <span className="metric-value">{renewableData.solar.potential.dailyKwhPer1kW} kWh</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Annual Output (per 1kW)</span>
                  <span className="metric-value">{renewableData.solar.potential.annualKwhPer1kW} kWh</span>
                </div>
              </div>

              {/* Rooftop Solar Estimate */}
              <div className="rooftop-estimate">
                <h4>
                  <Zap size={18} />
                  Rooftop Solar Estimate (100 m² roof)
                </h4>
                <div className="estimate-grid">
                  <div className="estimate-item">
                    <span>System Capacity</span>
                    <strong>{renewableData.solar.potential.rooftopEstimate.capacity} kW</strong>
                  </div>
                  <div className="estimate-item">
                    <span>Annual Generation</span>
                    <strong>{Math.round(renewableData.solar.potential.rooftopEstimate.annualGeneration)} kWh</strong>
                  </div>
                  <div className="estimate-item">
                    <span>CO₂ Saved Annually</span>
                    <strong>{Math.round(renewableData.solar.potential.rooftopEstimate.co2Saved)} kg</strong>
                  </div>
                  <div className="estimate-item">
                    <span>Annual Savings</span>
                    <strong>₹{renewableData.solar.potential.rooftopEstimate.savings.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wind Potential Section */}
          <div className="section wind-section">
            <div className="section-header">
              <Wind className="section-icon" />
              <h3>Wind Energy Potential</h3>
            </div>

            <div className="wind-info">
              <div className="wind-speed">
                <span className="speed-value">{renewableData.wind.currentSpeed}</span>
                <span className="speed-unit">m/s</span>
              </div>
              <div className="wind-category" style={{ backgroundColor: getCategoryColor(renewableData.wind.potential.category) }}>
                {renewableData.wind.potential.category}
              </div>
              <p className="wind-suitability">{renewableData.wind.potential.suitability}</p>
              {renewableData.wind.potential.commercialViability && (
                <div className="viability-badge">
                  ✓ Commercially Viable for Wind Energy
                </div>
              )}
            </div>
          </div>

          {/* State Renewable Energy Data */}
          {renewableData.state && renewableData.state.total > 0 && (
            <div className="section state-section">
              <div className="section-header">
                <TrendingUp className="section-icon" />
                <h3>{renewableData.state.state} - Renewable Energy Status</h3>
              </div>

              <div className="state-stats">
                <div className="stat">
                  <span className="stat-label">Total Installed</span>
                  <span className="stat-value">{renewableData.state.total.toLocaleString()} MW</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Solar Capacity</span>
                  <span className="stat-value">{renewableData.state.solar.toLocaleString()} MW</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Wind Capacity</span>
                  <span className="stat-value">{renewableData.state.wind.toLocaleString()} MW</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Utilization Rate</span>
                  <span className="stat-value">{renewableData.state.utilizationRate}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Weather Info */}
          <div className="weather-info">
            <h4>Current Weather Conditions</h4>
            <div className="weather-grid">
              <div className="weather-item">
                <span>Temperature</span>
                <strong>{renewableData.weather.temperature}°C</strong>
              </div>
              <div className="weather-item">
                <span>Humidity</span>
                <strong>{renewableData.weather.humidity}%</strong>
              </div>
              <div className="weather-item">
                <span>Cloud Cover</span>
                <strong>{renewableData.weather.cloudCover}%</strong>
              </div>
              <div className="weather-item">
                <span>Wind Speed</span>
                <strong>{renewableData.weather.windSpeed} m/s</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationTracker;
