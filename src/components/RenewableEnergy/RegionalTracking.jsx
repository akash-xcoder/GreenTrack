import { useState, useEffect } from 'react';
import { MapPin, TrendingUp, DollarSign, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getRenewableEnergyByRegion, getDecentralizedProjects, getFinancingOptions } from '../../services/renewableEnergyApi';
import { formatCapacity, formatPercentage, formatCurrency, getStatusColor } from '../../utils/formatters';
import './RegionalTracking.css';

const RegionalTracking = () => {
  const [regionalData, setRegionalData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [financing, setFinancing] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const regions = getRenewableEnergyByRegion();
    const projectsData = getDecentralizedProjects();
    const financingData = getFinancingOptions();

    setRegionalData(regions);
    setProjects(projectsData);
    setFinancing(financingData);
  };

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

  return (
    <div className="regional-tracking">
      <div className="section-header">
        <h1>Regional Renewable Energy Deployment</h1>
        <p>State-wise tracking of solar, wind, and other renewable energy capacity</p>
      </div>

      {/* Regional Capacity Chart */}
      <div className="card">
        <h2>State-wise Renewable Capacity</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={regionalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="state" angle={-45} textAnchor="end" height={100} />
            <YAxis label={{ value: 'Capacity (MW)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              formatter={(value) => formatCapacity(value)}
              contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="solar" fill="#f59e0b" name="Solar" />
            <Bar dataKey="wind" fill="#3b82f6" name="Wind" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Regional Details Table */}
      <div className="card">
        <h2>
          <MapPin size={24} />
          Regional Performance Metrics
        </h2>
        <div className="table-container">
          <table className="regional-table">
            <thead>
              <tr>
                <th>State</th>
                <th>Solar (MW)</th>
                <th>Wind (MW)</th>
                <th>Total (MW)</th>
                <th>Potential (MW)</th>
                <th>Utilization</th>
                <th>Growth</th>
                <th>Investment Needed</th>
              </tr>
            </thead>
            <tbody>
              {regionalData.map((region, index) => (
                <tr
                  key={index}
                  onClick={() => setSelectedRegion(region)}
                  className={selectedRegion?.state === region.state ? 'selected' : ''}
                >
                  <td className="state-name">{region.state}</td>
                  <td>{formatCapacity(region.solar)}</td>
                  <td>{formatCapacity(region.wind)}</td>
                  <td className="highlight">{formatCapacity(region.total)}</td>
                  <td>{formatCapacity(region.potential)}</td>
                  <td>
                    <div className="utilization-bar">
                      <div
                        className="utilization-fill"
                        style={{ width: `${region.utilizationRate}%` }}
                      ></div>
                      <span>{formatPercentage(region.utilizationRate)}</span>
                    </div>
                  </td>
                  <td className="growth-cell">+{region.recentGrowth}%</td>
                  <td>{formatCurrency(region.investmentNeeded)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Region Details */}
      {selectedRegion && (
        <div className="card selected-region-card">
          <h2>{selectedRegion.state} - Detailed View</h2>
          <div className="region-details-grid">
            <div className="detail-item">
              <Zap className="detail-icon" />
              <div>
                <label>Total Capacity</label>
                <value>{formatCapacity(selectedRegion.total)}</value>
              </div>
            </div>
            <div className="detail-item">
              <TrendingUp className="detail-icon" />
              <div>
                <label>Recent Growth</label>
                <value className="positive">+{selectedRegion.recentGrowth}%</value>
              </div>
            </div>
            <div className="detail-item">
              <MapPin className="detail-icon" />
              <div>
                <label>Utilization Rate</label>
                <value>{formatPercentage(selectedRegion.utilizationRate)}</value>
              </div>
            </div>
            <div className="detail-item">
              <DollarSign className="detail-icon" />
              <div>
                <label>Investment Required</label>
                <value>{formatCurrency(selectedRegion.investmentNeeded)}</value>
              </div>
            </div>
          </div>

          <div className="energy-mix">
            <h3>Energy Mix</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Solar', value: selectedRegion.solar },
                    { name: 'Wind', value: selectedRegion.wind }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#f59e0b" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip formatter={(value) => formatCapacity(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Decentralized Projects */}
      <div className="card">
        <h2>Decentralized Renewable Energy Projects</h2>
        <p className="card-subtitle">Local and community-level renewable energy initiatives</p>
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>{project.name}</h3>
                <span
                  className="status-badge"
                  style={{ background: getStatusColor(project.status) + '20', color: getStatusColor(project.status) }}
                >
                  {project.status}
                </span>
              </div>
              <div className="project-type">{project.type} • {project.location}</div>
              <div className="project-details">
                <div className="project-stat">
                  <label>Capacity</label>
                  <value>{formatCapacity(project.capacity)}</value>
                </div>
                <div className="project-stat">
                  <label>Households</label>
                  <value>{project.households.toLocaleString()}</value>
                </div>
                <div className="project-stat">
                  <label>Investment</label>
                  <value>{formatCurrency(project.investment)}</value>
                </div>
                <div className="project-stat">
                  <label>CO₂ Saved/year</label>
                  <value>{(project.co2Saved / 1000).toFixed(0)}k tons</value>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financing Options */}
      <div className="card">
        <h2>
          <DollarSign size={24} />
          Financing Mechanisms & Support Schemes
        </h2>
        <div className="financing-grid">
          {financing.map((scheme, index) => (
            <div key={index} className="financing-card">
              <h3>{scheme.scheme}</h3>
              <div className="financing-detail">
                <label>Provider:</label>
                <span>{scheme.provider}</span>
              </div>
              <div className="financing-detail">
                <label>Subsidy:</label>
                <span className="subsidy-badge">{scheme.subsidy}</span>
              </div>
              <div className="financing-detail">
                <label>Target:</label>
                <span>{scheme.target}</span>
              </div>
              <div className="financing-detail">
                <label>Scope:</label>
                <span>{scheme.scope}</span>
              </div>
              <div className="financing-detail">
                <label>Max Amount:</label>
                <span className="amount">{formatCurrency(scheme.maxAmount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegionalTracking;
