import { useState } from 'react'
import { LayoutDashboard, Wind, Cloud, MapPin, Menu, X, Search, Sparkles } from 'lucide-react'
import Dashboard from './components/Dashboard/Dashboard'
import RegionalTracking from './components/RenewableEnergy/RegionalTracking'
import EmissionsMonitor from './components/CarbonEmissions/EmissionsMonitor'
import LocalTracking from './components/LocalTracking/LocalTracking'
import LocationTracker from './components/LocationTracker/LocationTracker'
import AIAssistant from './components/AIAssistant/AIAssistant'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'location', name: 'Location Tracker', icon: Search },
    { id: 'renewable', name: 'Renewable Energy', icon: Wind },
    { id: 'emissions', name: 'Carbon Emissions', icon: Cloud },
    { id: 'local', name: 'Local Tracking', icon: MapPin }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'location':
        return <LocationTracker />
      case 'renewable':
        return <RegionalTracking />
      case 'emissions':
        return <EmissionsMonitor />
      case 'local':
        return <LocalTracking />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Wind className="logo-icon" />
            <div className="logo-text">
              <h1>GreenTrack India</h1>
              <p>Renewable Energy & Carbon Monitoring Platform</p>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="mobile-nav">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="app-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
