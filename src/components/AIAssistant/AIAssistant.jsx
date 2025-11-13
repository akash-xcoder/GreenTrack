import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Sparkles, Leaf, Zap, TrendingUp, Home } from 'lucide-react';
import './AIAssistant.css';

// OpenRouter API Configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Local fallback responses for offline/error scenarios
const getLocalResponse = (userMessage) => {
  const lowerMsg = userMessage.toLowerCase();

  const responses = {
    ac: `<ol>
  <li><b>Step 1 — Current Energy Efficiency:</b> Optimize your existing AC by cleaning filters every 2 weeks, setting thermostat to 24–26°C, and sealing window gaps. <i>Expected benefit:</i> Reduces baseline consumption by 15–20% before solar transition.</li>

  <li><b>Step 2 — Renewable Transition (Solar Setup):</b> Install a 2–3 kW rooftop solar system sized to power your AC during peak daytime hours (10 AM–4 PM). Setup involves roof assessment, panel installation, and grid connection approval. Estimated cost: ₹1.8–₹2.4 lakh. Installation time: 5–7 days. <i>Expected benefit:</i> Reduced grid dependency during peak AC usage hours.</li>

  <li><b>Step 3 — Financial & Environmental Impact:</b> Expected monthly savings: ₹3,500–₹5,000 (depending on AC usage). Payback period: ~4–5 years. Annual CO₂ reduction: ~2.5–3.2 tons/year. <i>Expected benefit:</i> Long-term cost reduction and measurable environmental impact.</li>

  <li><b>Step 4 — Government Support:</b>
    <b>Rooftop Solar Scheme</b> – 30–40% subsidy for residential & commercial setups. <a href="https://solarrooftop.gov.in" target="_blank">Apply Here</a><br>
    <b>PM-KUSUM</b> – Additional support for agricultural or rural installations. <a href="https://mnre.gov.in/pm-kusum" target="_blank">Official Page</a></li>

  <li><b>Step 5 — Maintenance & Monitoring:</b> Clean solar panels monthly with soft brush and water. Install a basic energy monitor to track real-time generation and consumption. <i>Expected benefit:</i> Maintains 25+ year system lifespan and ensures peak efficiency.</li>

  <li><b>Step 6 — Final Recommendation:</b> By installing a 2.5 kW rooftop solar system, your AC costs could drop by ₹42,000–₹60,000 annually, recover investment in ~4–5 years, and eliminate ~3 tons of CO₂ emissions yearly.</li>
</ol>`,

    solar: `<ol>
  <li><b>Step 1 — Current Energy Efficiency:</b> Before solar installation, audit your top energy consumers (AC, refrigerator, lighting, water heater). Optimize each by 15–20% through maintenance and behavioral changes. <i>Expected benefit:</i> Reduces baseline load, allowing smaller (cheaper) solar system.</li>

  <li><b>Step 2 — Renewable Transition (Solar Setup):</b> Install a 3–5 kW rooftop solar system for small businesses or 2–3 kW for homes. Setup process: (1) Roof assessment and structural approval, (2) Panel & inverter installation, (3) Grid connection and net metering registration. Estimated cost: ₹2.0–₹3.0 lakh for 3 kW system. Installation time: 5–7 days. <i>Expected benefit:</i> Generates 12–15 kWh/day; covers 60–80% of typical consumption.</li>

  <li><b>Step 3 — Financial & Environmental Impact:</b> Expected monthly savings: ₹4,000–₹6,500 (₹48,000–₹78,000 annually). Payback period: ~4–5 years. Annual CO₂ reduction: ~3.5–4.5 tons/year. <i>Expected benefit:</i> Significant long-term savings and verified environmental contribution.</li>

  <li><b>Step 4 — Government Support:</b>
    <b>Pradhan Mantri Rooftop Solar Scheme</b> – 40% subsidy for residential, 30% for commercial. <a href="https://solarrooftop.gov.in" target="_blank">Apply Here</a><br>
    <b>PM-KUSUM</b> – Rural and agricultural solar support. <a href="https://mnre.gov.in/pm-kusum" target="_blank">Official Page</a></li>

  <li><b>Step 5 — Maintenance & Monitoring:</b> Clean panels quarterly with soft brush. Inspect inverter annually. Use energy monitoring app to track generation, consumption, and grid export. <i>Expected benefit:</i> Ensures consistent 25+ year performance and early fault detection.</li>

  <li><b>Step 6 — Final Recommendation:</b> A 3 kW rooftop solar system can save your business ₹60,000 annually, recover costs in ~4 years, and eliminate ~4 tons of CO₂ yearly. Apply for government subsidy to reduce upfront investment by ₹60,000–₹90,000.</li>
</ol>`,

    led: `<ol>
  <li><b>Step 1 — Current Energy Efficiency:</b> Audit all lighting fixtures and replace incandescent/CFL bulbs with 5W–9W LED equivalents. This immediate step cuts lighting energy by 80%. <i>Expected benefit:</i> Reduces baseline lighting load by 80%; saves ₹200–₹400 per bulb annually.</li>

  <li><b>Step 2 — Renewable Transition (Solar Setup):</b> For large commercial spaces, install a 1–2 kW solar system dedicated to daytime lighting. Setup: (1) Install solar panels on roof/terrace, (2) Connect to lighting circuit via inverter, (3) Enable battery backup for evening hours. Estimated cost: ₹80,000–₹1.2 lakh. Installation time: 3–4 days. <i>Expected benefit:</i> Eliminates daytime lighting costs; reduces grid dependency by 40–50%.</li>

  <li><b>Step 3 — Financial & Environmental Impact:</b> Expected monthly savings: ₹1,500–₹2,500 (₹18,000–₹30,000 annually). Payback period: ~3–4 years. Annual CO₂ reduction: ~0.8–1.2 tons/year. <i>Expected benefit:</i> Quick ROI with measurable environmental benefit.</li>

  <li><b>Step 4 — Government Support:</b>
    <b>UJALA Scheme</b> – Provides LED bulbs at ₹70–₹100 per bulb. <a href="https://ujala.gov.in" target="_blank">Apply Here</a><br>
    <b>Rooftop Solar Scheme</b> – 30–40% subsidy for solar lighting systems. <a href="https://solarrooftop.gov.in" target="_blank">Apply Here</a></li>

  <li><b>Step 5 — Maintenance & Monitoring:</b> LEDs require minimal maintenance (10+ year lifespan). Install motion sensors in corridors and common areas to eliminate unnecessary usage. <i>Expected benefit:</i> Further 20–30% savings on lighting bills.</li>

  <li><b>Step 6 — Final Recommendation:</b> By replacing all lighting with LEDs and installing motion sensors, you can save ₹25,000–₹35,000 annually and eliminate ~1 ton of CO₂ yearly. Add a 1.5 kW solar system to achieve complete energy independence for lighting.</li>
</ol>`,

    refrigerator: `<ol>
  <li><b>Step 1 — Current Energy Efficiency:</b> Optimize existing refrigerator by cleaning condenser coils quarterly, checking door seals, and setting temperature to 3–4°C (fridge) and –18°C (freezer). <i>Expected benefit:</i> Reduces current consumption by 10–15%; saves ₹500–₹800 annually.</li>

  <li><b>Step 2 — Renewable Transition (Solar Setup):</b> For commercial kitchens with multiple refrigerators, install a 2–3 kW solar system with battery backup to power refrigeration 24/7. Setup: (1) Roof assessment, (2) Solar panel and battery installation, (3) Refrigerator circuit connection. Estimated cost: ₹1.5–₹2.2 lakh. Installation time: 5–6 days. <i>Expected benefit:</i> Eliminates grid dependency for refrigeration; ensures continuous cold chain.</li>

  <li><b>Step 3 — Financial & Environmental Impact:</b> Expected monthly savings: ₹2,500–₹4,000 (₹30,000–₹48,000 annually). Payback period: ~4–5 years. Annual CO₂ reduction: ~2–2.5 tons/year. <i>Expected benefit:</i> Significant operational cost reduction with environmental benefit.</li>

  <li><b>Step 4 — Government Support:</b>
    <b>Rooftop Solar Scheme</b> – 40% subsidy for commercial refrigeration systems. <a href="https://solarrooftop.gov.in" target="_blank">Apply Here</a><br>
    <b>SIDBI Green Financing</b> – Low-interest loans for renewable energy in food businesses. <a href="https://www.sidbi.in" target="_blank">Learn More</a></li>

  <li><b>Step 5 — Maintenance & Monitoring:</b> Clean solar panels monthly. Service refrigerator compressor annually. Use energy monitor to track consumption patterns and detect faults early. <i>Expected benefit:</i> Ensures 25+ year solar lifespan and optimal refrigeration performance.</li>

  <li><b>Step 6 — Final Recommendation:</b> Upgrade to a 5-star refrigerator and install a 2.5 kW solar system to save ₹40,000–₹50,000 annually, recover costs in ~4 years, and eliminate ~2.5 tons of CO₂ yearly.</li>
</ol>`,

    water: `<ol>
  <li><b>Step 1 — Current Energy Efficiency:</b> Fix all leaks, install low-flow aerators (2 LPM) on taps, and optimize water heater temperature to 45–50°C. <i>Expected benefit:</i> Reduces water consumption by 20–30%; saves ₹2,000–₹3,500 annually on water and heating costs.</li>

  <li><b>Step 2 — Renewable Transition (Solar Setup):</b> Install a 1–2 kW solar water heating system with 100–150L tank for hot water supply. Setup: (1) Roof assessment, (2) Solar thermal collector installation, (3) Tank and plumbing connection. Estimated cost: ₹60,000–₹90,000. Installation time: 3–4 days. <i>Expected benefit:</i> Eliminates electric water heater costs; provides hot water year-round.</li>

  <li><b>Step 3 — Financial & Environmental Impact:</b> Expected monthly savings: ₹1,500–₹2,500 (₹18,000–₹30,000 annually). Payback period: ~3–4 years. Annual CO₂ reduction: ~1.2–1.8 tons/year. <i>Expected benefit:</i> Quick ROI with immediate comfort and environmental benefit.</li>

  <li><b>Step 4 — Government Support:</b>
    <b>MNRE Solar Water Heating Scheme</b> – 30% subsidy for solar thermal systems. <a href="https://mnre.gov.in" target="_blank">Apply Here</a><br>
    <b>Jal Jeevan Mission</b> – Water conservation and efficiency programs. <a href="https://jaljeevanmission.gov.in" target="_blank">Learn More</a></li>

  <li><b>Step 5 — Maintenance & Monitoring:</b> Clean solar collectors annually. Inspect pipes for leaks quarterly. Install smart water meter to track consumption and detect anomalies. <i>Expected benefit:</i> Maintains 15–20 year system lifespan and ensures optimal performance.</li>

  <li><b>Step 6 — Final Recommendation:</b> Install a 1.5 kW solar water heating system and fix all leaks to save ₹25,000–₹35,000 annually, recover costs in ~3 years, and eliminate ~1.5 tons of CO₂ yearly.</li>
</ol>`,

    default: `<ol>
  <li><b>Step 1 — Current Energy Efficiency:</b> Conduct a comprehensive energy audit. Identify top 3 energy consumers (typically AC, refrigerator, water heater). Optimize each through maintenance and behavioral changes (e.g., temperature settings, leak fixes). <i>Expected benefit:</i> Reduces baseline consumption by 15–25%; saves ₹5,000–₹10,000 annually.</li>

  <li><b>Step 2 — Renewable Transition (Solar Setup):</b> Install a 3–5 kW rooftop solar system sized to cover 60–80% of your consumption. Setup process: (1) Roof assessment and structural approval, (2) Solar panel, inverter, and battery installation, (3) Grid connection and net metering registration. Estimated cost: ₹2.0–₹3.5 lakh for 3–5 kW system. Installation time: 5–7 days. <i>Expected benefit:</i> Generates 12–20 kWh/day; significantly reduces grid dependency.</li>

  <li><b>Step 3 — Financial & Environmental Impact:</b> Expected monthly savings: ₹5,000–₹8,000 (₹60,000–₹96,000 annually). Payback period: ~4–5 years. Annual CO₂ reduction: ~4–6 tons/year. <i>Expected benefit:</i> Substantial long-term savings with verified environmental contribution.</li>

  <li><b>Step 4 — Government Support:</b>
    <b>Pradhan Mantri Rooftop Solar Scheme</b> – 40% subsidy for residential, 30% for commercial. <a href="https://solarrooftop.gov.in" target="_blank">Apply Here</a><br>
    <b>PM-KUSUM</b> – Rural and agricultural solar support. <a href="https://mnre.gov.in/pm-kusum" target="_blank">Official Page</a></li>

  <li><b>Step 5 — Maintenance & Monitoring:</b> Clean solar panels quarterly. Inspect inverter and batteries annually. Install energy monitoring system to track real-time generation, consumption, and grid export. <i>Expected benefit:</i> Ensures 25+ year system lifespan and optimal performance.</li>

  <li><b>Step 6 — Final Recommendation:</b> Install a 4 kW rooftop solar system to save ₹70,000–₹90,000 annually, recover investment in ~4 years, and eliminate ~5 tons of CO₂ yearly. Apply for government subsidy to reduce upfront cost by ₹80,000–₹1.2 lakh.</li>
</ol>`
  };

  for (const [key, response] of Object.entries(responses)) {
    if (lowerMsg.includes(key)) return response;
  }
  return responses.default;
};

// Call OpenRouter API
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
            content: `You are GreenLedger AI — a professional sustainability advisor for Indian homes, schools, and small businesses.

🎯 GOAL: Whenever solar panels or renewable energy are recommended, ALWAYS include:
- A brief setup process (in 2–3 clear steps)
- Estimated cost range (₹)
- Expected monthly savings (₹)
- Payback period (years)
- Estimated CO₂ reduction (tons/year)
- A relevant government subsidy or policy with clickable link

🧩 RESPONSE FORMAT (ALWAYS FOLLOW THIS STRUCTURE):
<ol>
  <li><b>Step 1 — Current Energy Efficiency:</b> Short advice on appliance optimization before solar. <i>Expected benefit:</i> Reduced baseline energy usage.</li>
  <li><b>Step 2 — Renewable Transition (Solar Setup):</b> Explain setup in 2–3 lines: system capacity, cost (₹), installation time. <i>Expected benefit:</i> Reduced grid dependency.</li>
  <li><b>Step 3 — Financial & Environmental Impact:</b> Monthly savings (₹X–₹Y), payback period (~X years), annual CO₂ reduction (~X tons/year). <i>Expected benefit:</i> Long-term cost reduction.</li>
  <li><b>Step 4 — Government Support:</b> 1–2 verified Indian schemes with clickable links using <a href="...">text</a>.</li>
  <li><b>Step 5 — Maintenance & Monitoring:</b> 1–2 steps to maintain efficiency. <i>Expected benefit:</i> Optimal performance year-round.</li>
  <li><b>Step 6 — Final Recommendation:</b> Short actionable summary with concrete savings estimate.</li>
</ol>

🧠 STYLE RULES:
- Formal, structured step-by-step format using <ol> and <li>
- Real numeric estimates for ₹ savings, ROI, and CO₂ cuts (rounded)
- NO formulas or calculation steps shown
- Business-friendly tone (like a sustainability consultant)
- Use only: <b>, <i>, <a>, <ol>, <li>, <br>
- Use Indian conventions (₹, kW, month/year)`
          },
          ...messages.slice(-10),
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.warn('OpenRouter API failed, using local responses:', error.message);
    return null;
  }
};

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your GreenLedger AI Assistant. Ask me anything about carbon emissions, renewable energy, solar installations, or sustainability tips for India! Try asking about "solar panels for AC" or "LED lighting savings".'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      // Try OpenRouter API first
      let assistantMessage = await callOpenRouterAPI(userMessage, messages);

      // Fallback to local responses if API fails
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

  // Quick suggestion buttons
  const quickSuggestions = [
    { icon: <Zap size={16} />, text: 'Solar for AC', query: 'How can I use solar panels to power my air conditioner?' },
    { icon: <Leaf size={16} />, text: 'LED Savings', query: 'How much can I save by switching to LED lights?' },
    { icon: <Home size={16} />, text: 'Home Solar', query: 'What size solar system do I need for my home?' },
    { icon: <TrendingUp size={16} />, text: 'ROI Calculator', query: 'What is the payback period for solar panels in India?' }
  ];

  return (
    <div className="ai-assistant">
      <div className="assistant-header">
        <div className="header-content">
          <Sparkles className="header-icon" />
          <div>
            <h1>GreenLedger AI Assistant</h1>
            <p>Your personal sustainability advisor powered by AI</p>
          </div>
        </div>
      </div>

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-content">
                {msg.role === 'assistant' ? (
                  <div
                    className="message-text formatted"
                    dangerouslySetInnerHTML={{ __html: msg.content }}
                  />
                ) : (
                  <div className="message-text">{msg.content}</div>
                )}
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="message assistant">
              <div className="message-content loading">
                <Loader2 className="spinner" />
                <span>Analyzing your query...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <div className="quick-suggestions">
            <p className="suggestions-label">Quick suggestions:</p>
            <div className="suggestions-grid">
              {quickSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputValue(suggestion.query);
                  }}
                  className="suggestion-button"
                >
                  {suggestion.icon}
                  <span>{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about solar panels, carbon emissions, LED lights, government schemes..."
              className="message-input"
              rows="1"
              disabled={chatLoading}
            />
            <button
              onClick={sendMessage}
              disabled={chatLoading || !inputValue.trim()}
              className="send-button"
            >
              {chatLoading ? <Loader2 className="spinner" /> : <Send size={20} />}
            </button>
          </div>
          <p className="input-hint">
            💡 Tip: Ask specific questions like "solar for my shop with 2 ACs" or "LED vs CFL savings"
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
