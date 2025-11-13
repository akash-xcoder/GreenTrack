import { useState, useEffect } from 'react';
import { Cloud, TrendingDown, AlertTriangle, Factory, Building2, Car } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  getCarbonIntensityByDate,
  getEmissionsBySector,
  getLocalGovernmentData,
  calculateEmissions
} from '../../services/carbonApi';
import { formatEmissions, getCarbonIntensityColor, formatPercentage } from '../../utils/formatters';
import './EmissionsMonitor.css';

const EmissionsMonitor = () => {
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [sectorData, setSectorData] = useState([]);
  const [localData, setLocalData] = useState([]);
  const [emissionCalculator, setEmissionCalculator] = useState({
    kwh: 1000,
    result: null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Get last 30 days of carbon intensity data
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const timeSeries = await getCarbonIntensityByDate(
      thirtyDaysAgo.toISOString(),
      now.toISOString()
    );

    // Process time series for chart
    const chartData = timeSeries.map(item => ({
      date: new Date(item.from).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      intensity: item.intensity.actual || item.intensity.forecast
    }));

    setTimeSeriesData(chartData);
    setSectorData(getEmissionsBySector());
    setLocalData(getLocalGovernmentData());
  };

  const handleCalculateEmissions = () => {
    const result = calculateEmissions(parseFloat(emissionCalculator.kwh));
    setEmissionCalculator({ ...emissionCalculator, result });
  };

  const SECTOR_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6'];

  return (
    <div className="emissions-monitor">
      <div className="section-header">
        <h1>Carbon Emissions Monitoring & Reporting</h1>
        <p>Real-time tracking and transparent reporting of carbon emissions</p>
      </div>

      {/* Carbon Intensity Trend */}
      <div className="card">
        <h2>
          <Cloud size={24} />
          Carbon Intensity Trend (Last 30 Days)
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: 'gCO₂/kWh', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="intensity"
              stroke="#ef4444"
              strokeWidth={2}
              name="Carbon Intensity"
              dot={{ fill: '#ef4444' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Emissions by Sector */}
      <div className="card">
        <h2>
          <Factory size={24} />
          Emissions by Sector
        </h2>
        <p className="card-subtitle">Sectoral breakdown of carbon emissions and reduction targets</p>

        <div className="sector-grid">
          {sectorData.map((sector, index) => (
            <div key={index} className="sector-card">
              <div className="sector-header">
                <div className="sector-icon">
                  {getSectorIcon(sector.sector)}
                </div>
                <div className="sector-info">
                  <h3>{sector.sector}</h3>
                  <div className="sector-emissions">{formatEmissions(sector.emissions * 1000)}</div>
                </div>
              </div>

              <div className="sector-progress">
                <div className="progress-info">
                  <span>Current</span>
                  <span>Target</span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${(sector.emissions / sector.target) * 100}%`,
                      background: sector.emissions > sector.target ? '#ef4444' : '#10b981'
                    }}
                  ></div>
                </div>
                <div className="progress-values">
                  <span>{sector.emissions}k tons</span>
                  <span>{sector.target}k tons</span>
                </div>
              </div>

              <div className="sector-reduction">
                <TrendingDown size={16} />
                <span>{formatPercentage(sector.reduction)} reduction target</span>
              </div>
            </div>
          ))}
        </div>

        <div className="sector-chart">
          <h3>Emissions Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sectorData}
                dataKey="emissions"
                nameKey="sector"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ sector, percent }) => `${sector}: ${(percent * 100).toFixed(0)}%`}
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatEmissions(value * 1000)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Local Government Tracking */}
      <div className="card">
        <h2>
          <Building2 size={24} />
          State-level Emissions Tracking
        </h2>
        <p className="card-subtitle">Carbon emissions and renewable capacity by state</p>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={localData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis yAxisId="left" label={{ value: 'Emissions (tons)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'RE Capacity (MW)', angle: 90, position: 'insideRight' }} />
            <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Legend />
            <Bar yAxisId="left" dataKey="totalEmissions" fill="#ef4444" name="Total Emissions" />
            <Bar yAxisId="right" dataKey="renewableCapacity" fill="#10b981" name="Renewable Capacity" />
          </BarChart>
        </ResponsiveContainer>

        <div className="local-data-table">
          <table>
            <thead>
              <tr>
                <th>State</th>
                <th>Total Emissions</th>
                <th>Renewable Capacity</th>
                <th>Emission Reduction</th>
                <th>Solar Capacity</th>
                <th>Wind Capacity</th>
              </tr>
            </thead>
            <tbody>
              {localData.map((state, index) => (
                <tr key={index}>
                  <td className="state-name">{state.name}</td>
                  <td>{formatEmissions(state.totalEmissions * 1000)}</td>
                  <td>{state.renewableCapacity} MW</td>
                  <td className="reduction-cell">↓ {formatPercentage(state.emissionReduction)}</td>
                  <td>{state.solarCapacity} MW</td>
                  <td>{state.windCapacity} MW</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emissions Calculator */}
      <div className="card calculator-card">
        <h2>
          <AlertTriangle size={24} />
          Carbon Emissions Calculator
        </h2>
        <p className="card-subtitle">Calculate CO₂ emissions from energy consumption</p>

        <div className="calculator">
          <div className="calculator-input">
            <label>Energy Consumption (kWh)</label>
            <input
              type="number"
              value={emissionCalculator.kwh}
              onChange={(e) => setEmissionCalculator({ ...emissionCalculator, kwh: e.target.value })}
              placeholder="Enter kWh"
            />
            <button onClick={handleCalculateEmissions} className="calculate-btn">
              Calculate Emissions
            </button>
          </div>

          {emissionCalculator.result && (
            <div className="calculator-results">
              <div className="result-card">
                <div className="result-label">CO₂ Emissions</div>
                <div className="result-value">{formatEmissions(emissionCalculator.result.co2)}</div>
              </div>
              <div className="result-card">
                <div className="result-label">CO₂ Equivalent</div>
                <div className="result-value">{formatEmissions(emissionCalculator.result.co2e)}</div>
              </div>
              <div className="result-card">
                <div className="result-label">Trees to Offset</div>
                <div className="result-value">{emissionCalculator.result.trees} trees</div>
                <div className="result-note">Trees needed for 1 year to offset emissions</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Insights */}
      <div className="card insights-card">
        <h2>Key Insights & Recommendations</h2>
        <div className="insights-grid">
          <div className="insight">
            <div className="insight-icon success">✓</div>
            <div className="insight-content">
              <h3>Progress Made</h3>
              <p>Average emission reduction of {formatPercentage(11)} across sectors through renewable energy adoption</p>
            </div>
          </div>
          <div className="insight">
            <div className="insight-icon warning">!</div>
            <div className="insight-content">
              <h3>Action Required</h3>
              <p>Energy and Transport sectors need accelerated decarbonization efforts to meet 2030 targets</p>
            </div>
          </div>
          <div className="insight">
            <div className="insight-icon info">i</div>
            <div className="insight-content">
              <h3>Transparency Gap</h3>
              <p>Need for digitization of emission tracking at local business and government levels</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get sector icons
const getSectorIcon = (sector) => {
  const icons = {
    'Energy': <Zap size={24} />,
    'Transport': <Car size={24} />,
    'Industry': <Factory size={24} />,
    'Agriculture': <Cloud size={24} />,
    'Residential': <Building2 size={24} />
  };
  return icons[sector] || <Cloud size={24} />;
};

// Import missing icon
const Zap = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

export default EmissionsMonitor;
