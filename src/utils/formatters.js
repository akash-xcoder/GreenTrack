/**
 * Utility functions for formatting data
 */

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format number to Indian numbering system (Lakhs, Crores)
 */
export const formatIndianNumber = (num) => {
  if (num === undefined || num === null) return '0';

  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `${(num / 100000).toFixed(2)} L`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} K`;
  }
  return num.toString();
};

/**
 * Format capacity in MW/GW
 */
export const formatCapacity = (mw) => {
  if (mw >= 1000) {
    return `${(mw / 1000).toFixed(1)} GW`;
  }
  return `${mw} MW`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format emissions
 */
export const formatEmissions = (kg) => {
  if (kg >= 1000000) {
    return `${(kg / 1000000).toFixed(2)} Mt`; // Megatonnes
  } else if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} t`; // Tonnes
  }
  return `${kg.toFixed(2)} kg`;
};

/**
 * Format currency in Indian Rupees
 */
export const formatCurrency = (amount) => {
  return `₹${formatIndianNumber(amount)}`;
};

/**
 * Get color for carbon intensity level
 */
export const getCarbonIntensityColor = (intensity) => {
  if (intensity < 300) return '#10b981'; // green
  if (intensity < 500) return '#3b82f6'; // blue
  if (intensity < 600) return '#f59e0b'; // yellow
  if (intensity < 700) return '#f97316'; // orange
  return '#ef4444'; // red
};

/**
 * Get status color
 */
export const getStatusColor = (status) => {
  const statusColors = {
    'Active': '#10b981',
    'Under Construction': '#f59e0b',
    'Planning': '#3b82f6',
    'Completed': '#6366f1',
    'Delayed': '#ef4444'
  };
  return statusColors[status] || '#6b7280';
};

/**
 * Calculate progress color
 */
export const getProgressColor = (percentage) => {
  if (percentage >= 75) return '#10b981';
  if (percentage >= 50) return '#3b82f6';
  if (percentage >= 25) return '#f59e0b';
  return '#ef4444';
};

/**
 * Format date
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format time
 */
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate year-over-year growth
 */
export const calculateGrowth = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};
