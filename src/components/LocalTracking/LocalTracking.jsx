import { useState } from 'react';
import { MapPin, Target, Zap, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { getGridIntegrationStatus, getRenewableEnergyTimeSeries } from '../../services/renewableEnergyApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCapacity, formatPercentage } from '../../utils/formatters';
import './LocalTracking.css';

const LocalTracking = () => {
  const [gridStatus] = useState(getGridIntegrationStatus());
  const [timeSeriesData] = useState(getRenewableEnergyTimeSeries());
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  // Mock local implementation data
  const localImplementations = [
    {
      id: 1,
      location: 'Delhi NCR',
      type: 'Urban Solar Initiative',
      status: 'Active',
      target: 1000, // MW
      achieved: 750,
      beneficiaries: 250000,
      co2Reduction: 850000, // tons/year
      challenges: ['Grid integration', 'Land availability'],
      timeline: '2022-2025'
    },
    {
      id: 2,
      location: 'Rural Maharashtra',
      type: 'Wind + Solar Hybrid',
      status: 'Under Construction',
      target: 500,
      achieved: 200,
      beneficiaries: 150000,
      co2Reduction: 400000,
      challenges: ['Transmission infrastructure', 'Financing'],
      timeline: '2023-2026'
    },
    {
      id: 3,
      location: 'Tamil Nadu Coastal',
      type: 'Offshore Wind Project',
      status: 'Planning',
      target: 2000,
      achieved: 0,
      beneficiaries: 500000,
      co2Reduction: 2500000,
      challenges: ['Environmental clearance', 'Technology transfer'],
      timeline: '2024-2028'
    },
    {
      id: 4,
      location: 'Rajasthan Desert Region',
      type: 'Large-scale Solar Parks',
      status: 'Active',
      target: 3000,
      achieved: 2100,
      beneficiaries: 800000,
      co2Reduction: 3200000,
      challenges: ['Water scarcity', 'Dust management'],
      timeline: '2020-2025'
    },
    {
      id: 5,
      location: 'Himalayan States',
      type: 'Small Hydro + Solar',
      status: 'Active',
      target: 250,
      achieved: 180,
      beneficiaries: 80000,
      co2Reduction: 200000,
      challenges: ['Terrain difficulties', 'Seasonal variation'],
      timeline: '2021-2024'
    }
  ];

  const policyInitiatives = [
    {
      title: 'PM-KUSUM Solar Agriculture',
      description: 'Solarization of agriculture pumps and grid-connected solar power',
      impact: 'Target: 30.8 GW by 2026',
      status: 'Active',
      coverage: '15 states'
    },
    {
      title: 'Green Energy Corridor Phase II',
      description: 'Transmission system strengthening for renewable energy integration',
      impact: 'Investment: ₹12,000 Cr',
      status: 'Under Implementation',
      coverage: 'All India'
    },
    {
      title: 'Solar Rooftop Scheme Phase II',
      description: 'Achieving 40 GW rooftop solar by 2022 (extended to 2026)',
      impact: 'Target: 40 GW',
      status: 'Active',
      coverage: 'Residential sector'
    },
    {
      title: 'Production Linked Incentive (PLI)',
      description: 'Incentivizing domestic solar manufacturing',
      impact: 'Investment: ₹24,000 Cr',
      status: 'Active',
      coverage: 'Manufacturing sector'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Active': '#10b981',
      'Under Construction': '#f59e0b',
      'Planning': '#3b82f6',
      'Delayed': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'High': '#ef4444',
      'Medium': '#f59e0b',
      'Low': '#10b981'
    };
    return colors[severity] || '#6b7280';
  };

  return (
    <div className="local-tracking">
      <div className="section-header">
        <h1>Local-Level Implementation Tracking</h1>
        <p>Bridging the gap between national targets and local execution</p>
      </div>

      {/* Implementation Progress */}
      <div className="card">
        <h2>
          <MapPin size={24} />
          Regional Implementation Projects
        </h2>
        <div className="implementations-grid">
          {localImplementations.map((impl) => {
            const progress = (impl.achieved / impl.target) * 100;
            return (
              <div key={impl.id} className="implementation-card">
                <div className="impl-header">
                  <div>
                    <h3>{impl.location}</h3>
                    <div className="impl-type">{impl.type}</div>
                  </div>
                  <span
                    className="impl-status"
                    style={{
                      background: getStatusColor(impl.status) + '20',
                      color: getStatusColor(impl.status)
                    }}
                  >
                    {impl.status}
                  </span>
                </div>

                <div className="impl-progress">
                  <div className="progress-label">
                    <span>Progress: {formatPercentage(progress)}</span>
                    <span>{formatCapacity(impl.achieved)} / {formatCapacity(impl.target)}</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${progress}%`,
                        background: getStatusColor(impl.status)
                      }}
                    ></div>
                  </div>
                </div>

                <div className="impl-stats">
                  <div className="impl-stat">
                    <Zap size={16} />
                    <span>{impl.beneficiaries.toLocaleString()} beneficiaries</span>
                  </div>
                  <div className="impl-stat">
                    <TrendingUp size={16} />
                    <span>{(impl.co2Reduction / 1000).toFixed(0)}k tons CO₂/year</span>
                  </div>
                  <div className="impl-stat">
                    <Clock size={16} />
                    <span>{impl.timeline}</span>
                  </div>
                </div>

                <div className="impl-challenges">
                  <strong>Challenges:</strong>
                  <div className="challenges-tags">
                    {impl.challenges.map((challenge, idx) => (
                      <span key={idx} className="challenge-tag">{challenge}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Progress */}
      <div className="card">
        <h2>
          <TrendingUp size={24} />
          Historical Deployment Progress
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis label={{ value: 'Capacity (MW)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              formatter={(value) => formatCapacity(value)}
              contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Line type="monotone" dataKey="solar" stroke="#f59e0b" strokeWidth={2} name="Solar" />
            <Line type="monotone" dataKey="wind" stroke="#3b82f6" strokeWidth={2} name="Wind" />
            <Line type="monotone" dataKey="hydro" stroke="#06b6d4" strokeWidth={2} name="Hydro" />
            <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} name="Total" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Grid Integration Challenges */}
      <div className="card">
        <h2>
          <AlertCircle size={24} />
          Grid Integration & Infrastructure Challenges
        </h2>
        <p className="card-subtitle">Key bottlenecks and solutions for renewable energy integration</p>

        <div className="challenges-grid">
          {gridStatus.challenges.map((challenge, index) => (
            <div
              key={index}
              className="challenge-card"
              onClick={() => setSelectedChallenge(challenge)}
            >
              <div className="challenge-header">
                <h3>{challenge.issue}</h3>
                <span
                  className="severity-badge"
                  style={{
                    background: getSeverityColor(challenge.severity) + '20',
                    color: getSeverityColor(challenge.severity)
                  }}
                >
                  {challenge.severity}
                </span>
              </div>

              <div className="challenge-metrics">
                {challenge.currentCapacity !== undefined && (
                  <div className="metric">
                    <label>Current</label>
                    <value>{challenge.currentCapacity.toLocaleString()} MWh</value>
                  </div>
                )}
                {challenge.requiredCapacity !== undefined && (
                  <div className="metric">
                    <label>Required</label>
                    <value>{challenge.requiredCapacity.toLocaleString()} MWh</value>
                  </div>
                )}
                {challenge.currentCoverage !== undefined && (
                  <div className="metric">
                    <label>Coverage</label>
                    <value>{formatPercentage(challenge.currentCoverage)}</value>
                  </div>
                )}
                {challenge.reliability !== undefined && (
                  <div className="metric">
                    <label>Reliability</label>
                    <value>{formatPercentage(challenge.reliability)}</value>
                  </div>
                )}
                {challenge.deployment !== undefined && (
                  <div className="metric">
                    <label>Deployment</label>
                    <value>{formatPercentage(challenge.deployment)}</value>
                  </div>
                )}
              </div>

              <div className="challenge-progress">
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${challenge.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{formatPercentage(challenge.progress)} progress</span>
              </div>
            </div>
          ))}
        </div>

        <div className="solutions-section">
          <h3>
            <CheckCircle size={20} />
            Proposed Solutions
          </h3>
          <ul className="solutions-list">
            {gridStatus.solutions.map((solution, index) => (
              <li key={index}>
                <span className="solution-bullet">→</span>
                {solution}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Policy Initiatives */}
      <div className="card">
        <h2>
          <Target size={24} />
          Active Policy Initiatives
        </h2>
        <div className="policies-grid">
          {policyInitiatives.map((policy, index) => (
            <div key={index} className="policy-card">
              <div className="policy-status">
                <CheckCircle size={20} />
                <span>{policy.status}</span>
              </div>
              <h3>{policy.title}</h3>
              <p className="policy-description">{policy.description}</p>
              <div className="policy-impact">
                <strong>Impact:</strong> {policy.impact}
              </div>
              <div className="policy-coverage">
                <MapPin size={16} />
                <span>{policy.coverage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="card cta-card">
        <h2>Accelerating Local Implementation</h2>
        <div className="cta-content">
          <p>
            Effective climate mitigation requires seamless coordination between national policy and local execution.
            This platform enables:
          </p>
          <ul>
            <li>Real-time tracking of project implementation across regions</li>
            <li>Transparent reporting of progress against targets</li>
            <li>Early identification of bottlenecks and challenges</li>
            <li>Data-driven decision making for resource allocation</li>
            <li>Community engagement and stakeholder participation</li>
          </ul>
          <div className="cta-actions">
            <button className="primary-btn">Report Progress</button>
            <button className="secondary-btn">View Documentation</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalTracking;
