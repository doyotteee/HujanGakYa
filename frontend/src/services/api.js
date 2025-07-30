import axios from 'axios';

// Set base URL for API calls
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Untuk production di Vercel
  : process.env.REACT_APP_API_URL || 'http://localhost:5000';  // Untuk development

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {

    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {

    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.message);
    if (error.response?.status === 503) {
      throw new Error('Service temporarily unavailable. Please try again later.');
    }
    if (error.response?.status === 404) {
      throw new Error('Data not found.');
    }
    throw error;
  }
);

/**
 * Get API information and statistics
 */
export async function getApiInfo() {
  try {
    const response = await api.get('/api');
    return response.data;
  } catch (error) {
    console.error('Error fetching API info:', error);
    throw error;
  }
}

/**
 * Fetch weather data for a specific ADM4 code
 */
export async function fetchWeather(adm4) {
  try {
    if (!adm4) {
      throw new Error('ADM4 code is required');
    }
    const response = await api.get(`/api/weather?adm4=${adm4}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}

/**
 * Search villages/desa by query
 */
export async function searchDesa(query, limit = 20) {
  try {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query is required');
    }
    const response = await api.get(`/api/search-desa?q=${encodeURIComponent(query.trim())}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error searching desa:', error);
    throw error;
  }
}

/**
 * Get all villages with pagination
 */
export async function getAllDesa(offset = 0, limit = 100) {
  try {
    const response = await api.get(`/api/desa?offset=${offset}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all desa:', error);
    throw error;
  }
}

/**
 * Get villages by province
 */
export async function getDesaByProvince(provinsi, offset = 0, limit = 50) {
  try {
    if (!provinsi) {
      throw new Error('Province name is required');
    }
    const response = await api.get(`/api/desa/provinsi/${encodeURIComponent(provinsi)}?offset=${offset}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching desa by province:', error);
    throw error;
  }
}

/**
 * Smart search locations with partial matching
 */
export async function searchLocations(field, value, partial = false) {
  try {
    if (!field || !value) {
      throw new Error('Field and value are required');
    }
    const response = await api.get(`/api/weather/search/${encodeURIComponent(field)}/${encodeURIComponent(value)}?partial=${partial}`);
    return response.data;
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
}

/**
 * Check API health
 */
export async function checkHealth() {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
}

export default api;