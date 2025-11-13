import { useState, useEffect, useRef } from 'react';
import { Battery, Wind, Sun, Zap, TrendingUp, AlertCircle, Sparkles, Send, Loader2, Leaf, Home } from 'lucide-react';
import { getRenewableEnergyOverview, calculateTargetProgress, getRealTimeGeneration } from '../../services/renewableEnergyApi';
import { getCurrentCarbonIntensity } from '../../services/carbonApi';
import { formatCapacity, formatPercentage, getCarbonIntensityColor } from '../../utils/formatters';
import './Dashboard.css';

// OpenRouter API Configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Local fallback response
const getLocalResponse = (userMessage) => {
  const lowerMsg = userMessage.toLowerCase();

  if (lowerMsg.includes('ac') || lowerMsg.includes('air conditioner')) {
    return `<ol>
  <li><b>Step 1 — Current Energy Efficiency:</b> Optimize your existing AC by cleaning filters every 2 weeks, setting thermostat to 24–26°C, and sealing window gaps. <i>Expected benefit:</i> Reduces baseline consumption by 15–20%.</li>
  <li><b>Step 2 — Renewable Transition:</b> Install a 2–3 kW rooftop solar system. Estimated cost: ₹1.8–₹2.4 lakh. Installation time: 5–7 days. <i>Expected benefit:</i> Reduced grid dependency during peak AC hours.</li>
  <li><b>Step 3 — Financial Impact:</b> Monthly savings: ₹3,500–₹5,000. Payback period: ~4–5 years. Annual CO₂ reduction: ~2.5–3.2 tons/year.</li>
  <li><b>Step 4 — Government Support:</b> <b>Rooftop Solar Scheme</b> – 30–40% subsidy. <a href="https://solarrooftop.gov.in" target="_blank">Apply Here</a></li>
  <li><b>Step 5 — Maintenance:</b> Clean solar panels monthly. Install energy monitor. <i>Expected benefit:</i> Maintains 25+ year lifespan.</li>
  <li><b>Step 6 — Recommendation:</b> A 2.5 kW solar system could save ₹42,000–₹60,000 annually and eliminate ~3 tons of CO₂ yearly.</li>
</ol>`;
  }

  return `<ol>
  <li><b>Step 1 — Current Energy Efficiency:</b> Conduct a comprehensive energy audit. Optimize top 3 energy consumers. <i>Expected benefit:</i> Reduces baseline by 15–25%; saves ₹5,000–₹10,000 annually.</li>
  <li><b>Step 2 — Renewable Transition:</b> Install a 3–5 kW rooftop solar system. Cost: ₹2.0–₹3.5 lakh. Installation: 5–7 days. <i>Expected benefit:</i> Generates 12–20 kWh/day.</li>
  <li><b>Step 3 — Financial Impact:</b> Monthly savings: ₹5,000–₹8,000. Payback: ~4–5 years. CO₂ reduction: ~4–6 tons/year.</li>
  <li><b>Step 4 — Government Support:</b> <b>PM Rooftop Solar</b> – 40% subsidy (residential), 30% (commercial). <a href="https://solarrooftop.gov.in" target="_blank">Apply Here</a></li>
  <li><b>Step 5 — Maintenance:</b> Clean panels quarterly. Inspect inverter annually. <i>Expected benefit:</i> 25+ year performance.</li>
  <li><b>Step 6 — Recommendation:</b> Install 4 kW system to save ₹70,000–₹90,000 annually, recover in ~4 years, eliminate ~5 tons CO₂ yearly.</li>
</ol>`;
};

const callOpenRouterAPI = async (userMessage, messages) => {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'GreenTrack India AI'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are GreenLedger AI for India. Provide 6-step sustainability advice with cost (₹), savings, ROI, CO₂ reduction, and government scheme links. Use <ol>, <li>, <b>, <i>, <a> tags only.`
          },
          ...messages.slice(-10),
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 600
      })
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.warn('OpenRouter API failed, using local responses:', error.message);
    return null;
  }
};

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [targetProgress, setTargetProgress] = useState(null);
  const [realTimeGen, setRealTimeGen] = useState(null);
  const [carbonData, setCarbonData] = useState(null);

  // AI Assistant state
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your GreenLedger AI Assistant. Ask me about solar panels, carbon emissions, LED lighting, or sustainability tips! Try: "How can I reduce my AC electricity bill?"' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load initial data
    loadDashboardData();

    // Update real-time data every 30 seconds
    const interval = setInterval(() => {
      loadRealTimeData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    const overviewData = getRenewableEnergyOverview();
    const progressData = calculateTargetProgress();
    const carbonIntensity = await getCurrentCarbonIntensity();

    setOverview(overviewData);
    setTargetProgress(progressData);
    setCarbonData(carbonIntensity);
    loadRealTimeData();
  };

  const loadRealTimeData = () => {
    const genData = getRealTimeGeneration();
    genData.total = genData.solar + genData.wind + genData.hydro + genData.biomass;
    genData.renewablePercentage = (genData.total / genData.gridLoad) * 100;
    setRealTimeGen(genData);
  };

  // AI Assistant functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      let assistantMessage = await callOpenRouterAPI(userMessage, messages);
      if (!assistantMessage) {
        assistantMessage = getLocalResponse(userMessage);
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Chat error:', error);
      const fallbackMsg = getLocalResponse(userMessage);
      setMessages((prev) => [...prev, { role: 'assistant', content: fallbackMsg }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!overview || !targetProgress || !realTimeGen) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>India Renewable Energy & Carbon Tracking Platform</h1>
        <p className="subtitle">Real-time monitoring of renewable energy deployment and carbon emissions</p>
      </div>

      {/* AI Assistant Section */}
      <div className="card ai-assistant-card">
        <div className="card-header ai-header">
          <Sparkles size={24} />
          <h2>GreenLedger AI Assistant</h2>
        </div>

        <div className="ai-chat-container">
          <div className="ai-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-message ${msg.role}`}>
                <div className="ai-message-content">
                  {msg.role === 'assistant' ? (
                    <div
                      className="ai-text formatted"
                      dangerouslySetInnerHTML={{ __html: msg.content }}
                    />
                  ) : (
                    <div className="ai-text">{msg.content}</div>
                  )}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="ai-message assistant">
                <div className="ai-thinking-box">
                  <div className="thinking-header">
                    <Sparkles className="thinking-icon" size={18} />
                    <span className="thinking-text">AI is thinking</span>
                    <div className="thinking-dots">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                  <div className="thinking-progress">
                    <div className="progress-bar"></div>
                  </div>
                  <div className="thinking-status">
                    <div className="status-item">
                      <div className="status-icon pulse-1"></div>
                      <span>Analyzing your query</span>
                    </div>
                    <div className="status-item">
                      <div className="status-icon pulse-2"></div>
                      <span>Calculating sustainability metrics</span>
                    </div>
                    <div className="status-item">
                      <div className="status-icon pulse-3"></div>
                      <span>Preparing recommendations</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div className="ai-suggestions">
              <button onClick={() => setInputValue('How can I use solar panels to power my AC?')} className="ai-suggestion-btn">
                <Zap size={14} /> Solar for AC
              </button>
              <button onClick={() => setInputValue('How much can I save by switching to LED lights?')} className="ai-suggestion-btn">
                <Leaf size={14} /> LED Savings
              </button>
              <button onClick={() => setInputValue('What size solar system do I need for my home?')} className="ai-suggestion-btn">
                <Home size={14} /> Home Solar
              </button>
            </div>
          )}

          <div className="ai-input-area">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about solar, LED, carbon emissions, or sustainability..."
              className="ai-input"
              disabled={chatLoading}
            />
            <button
              onClick={sendMessage}
              disabled={chatLoading || !inputValue.trim()}
              className="ai-send-btn"
            >
              {chatLoading ? <Loader2 className="spinner" size={18} /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <MetricCard
          icon={<Battery size={32} />}
          title="Total Renewable Capacity"
          value={formatCapacity(overview.totalCapacity)}
          subtitle={`Target 2030: ${formatCapacity(overview.targets[2030])}`}
          color="#10b981"
        />
        <MetricCard
          icon={<Sun size={32} />}
          title="Solar Capacity"
          value={formatCapacity(overview.breakdown.solar.installed)}
          subtitle={`Growth: +${formatPercentage(overview.breakdown.solar.growth)}`}
          color="#f59e0b"
        />
        <MetricCard
          icon={<Wind size={32} />}
          title="Wind Capacity"
          value={formatCapacity(overview.breakdown.wind.installed)}
          subtitle={`Growth: +${formatPercentage(overview.breakdown.wind.growth)}`}
          color="#3b82f6"
        />
        <MetricCard
          icon={<TrendingUp size={32} />}
          title="2030 Target Progress"
          value={formatPercentage(parseFloat(targetProgress.achieved), 0)}
          subtitle={`${formatCapacity(targetProgress.remaining)} remaining`}
          color="#6366f1"
        />
      </div>

      {/* Real-time Generation */}
      <div className="card">
        <div className="card-header">
          <Zap size={24} />
          <h2>Real-Time Renewable Generation</h2>
          <span className="live-indicator">● LIVE</span>
        </div>
        <div className="generation-grid">
          <GenerationItem
            label="Solar"
            current={realTimeGen.solar}
            capacity={overview.breakdown.solar.installed}
            color="#f59e0b"
          />
          <GenerationItem
            label="Wind"
            current={realTimeGen.wind}
            capacity={overview.breakdown.wind.installed}
            color="#3b82f6"
          />
          <GenerationItem
            label="Hydro"
            current={realTimeGen.hydro}
            capacity={overview.breakdown.hydro.installed}
            color="#06b6d4"
          />
          <GenerationItem
            label="Biomass"
            current={realTimeGen.biomass}
            capacity={overview.breakdown.biomass.installed}
            color="#10b981"
          />
        </div>
        <div className="generation-summary">
          <div className="summary-item">
            <span>Total Renewable Generation:</span>
            <strong>{formatCapacity(realTimeGen.total)}</strong>
          </div>
          <div className="summary-item">
            <span>Grid Load:</span>
            <strong>{formatCapacity(realTimeGen.gridLoad)}</strong>
          </div>
          <div className="summary-item">
            <span>Renewable Share:</span>
            <strong className="highlight">{formatPercentage(realTimeGen.renewablePercentage)}</strong>
          </div>
        </div>
      </div>

      {/* Carbon Intensity */}
      {carbonData && (
        <div className="card">
          <div className="card-header">
            <AlertCircle size={24} />
            <h2>Carbon Intensity</h2>
          </div>
          <div className="carbon-intensity">
            <div className="intensity-value" style={{ color: getCarbonIntensityColor(carbonData.intensity.actual) }}>
              {carbonData.intensity.actual || carbonData.intensity.forecast}
              <span className="unit">gCO₂/kWh</span>
            </div>
            <div className="intensity-label">
              Current carbon intensity level: <strong>{carbonData.intensity.index}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Target Progress */}
      <div className="card">
        <h2>Progress Toward 2030 Target</h2>
        <div className="progress-details">
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${targetProgress.achieved}%` }}
            ></div>
          </div>
          <div className="progress-stats">
            <div className="stat">
              <label>Current Capacity</label>
              <value>{formatCapacity(targetProgress.currentCapacity)}</value>
            </div>
            <div className="stat">
              <label>Target Capacity</label>
              <value>{formatCapacity(targetProgress.targetCapacity)}</value>
            </div>
            <div className="stat">
              <label>Years Remaining</label>
              <value>{targetProgress.yearsLeft} years</value>
            </div>
            <div className="stat">
              <label>Annual Requirement</label>
              <value>{formatCapacity(targetProgress.annualRequirement)}/year</value>
            </div>
          </div>
          <div className={`status-badge ${targetProgress.onTrack ? 'on-track' : 'behind'}`}>
            {targetProgress.onTrack ? '✓ On Track' : '⚠ Accelerated Deployment Needed'}
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="card">
        <h2>Recent Achievements</h2>
        <ul className="achievements-list">
          {overview.progress.recentAchievements.map((achievement, index) => (
            <li key={index}>
              <span className="achievement-bullet">✓</span>
              {achievement}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ icon, title, value, subtitle, color }) => (
  <div className="metric-card">
    <div className="metric-icon" style={{ color }}>
      {icon}
    </div>
    <div className="metric-content">
      <div className="metric-title">{title}</div>
      <div className="metric-value" style={{ color }}>{value}</div>
      <div className="metric-subtitle">{subtitle}</div>
    </div>
  </div>
);

// Generation Item Component
const GenerationItem = ({ label, current, capacity, color }) => {
  const percentage = (current / capacity) * 100;
  return (
    <div className="generation-item">
      <div className="generation-label">{label}</div>
      <div className="generation-bar-container">
        <div
          className="generation-bar-fill"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
      </div>
      <div className="generation-values">
        <span>{formatCapacity(current)}</span>
        <span className="capacity">/ {formatCapacity(capacity)}</span>
      </div>
    </div>
  );
};

export default Dashboard;
