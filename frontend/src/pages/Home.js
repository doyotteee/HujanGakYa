import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import * as api from '../services/api';
import MapView from '../components/MapView';
import WeatherVideoBackground from '../components/WeatherVideoBackground';
import { generateAlerts } from '../utils/alertSystem';
import { AlertBanner } from '../components/AlertComponents';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Untuk production di Vercel (same domain)
  : process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Untuk development

// Mock data untuk fallback
const mockWeatherData = {
  lokasi: {
    desa: 'Gambir',
    kecamatan: 'Gambir',
    kabupaten: 'Jakarta Pusat',
    provinsi: 'DKI Jakarta'
  },
  currentWeather: {
    temperature: { celsius: 28, fahrenheit: 82 },
    weather: { description: 'Berawan Sebagian' },
    wind: { speed: 15, direction: 'Tenggara' },
    humidity: 65,
    visibility: { value: 10, text: 'Good' }
  },
  forecast: [
    {
      day: 1,
      forecasts: [
        { temperature: { celsius: 28 }, local_datetime: '2024-01-01 06:00', weather: { description: 'Berawan' } },
        { temperature: { celsius: 30 }, local_datetime: '2024-01-01 09:00', weather: { description: 'Cerah' } },
        { temperature: { celsius: 32 }, local_datetime: '2024-01-01 12:00', weather: { description: 'Cerah' } },
        { temperature: { celsius: 29 }, local_datetime: '2024-01-01 15:00', weather: { description: 'Berawan' } },
        { temperature: { celsius: 27 }, local_datetime: '2024-01-01 18:00', weather: { description: 'Berawan' } },
        { temperature: { celsius: 26 }, local_datetime: '2024-01-01 21:00', weather: { description: 'Berawan' } },
        { temperature: { celsius: 25 }, local_datetime: '2024-01-02 00:00', weather: { description: 'Berawan' } },
        { temperature: { celsius: 24 }, local_datetime: '2024-01-02 03:00', weather: { description: 'Berawan' } }
      ]
    },
    {
      day: 2,
      forecasts: [
        { temperature: { celsius: 25 }, local_datetime: '2024-01-02 06:00', weather: { description: 'Berawan' } },
        { temperature: { celsius: 27 }, local_datetime: '2024-01-02 09:00', weather: { description: 'Cerah' } },
        { temperature: { celsius: 30 }, local_datetime: '2024-01-02 12:00', weather: { description: 'Cerah' } },
        { temperature: { celsius: 28 }, local_datetime: '2024-01-02 15:00', weather: { description: 'Berawan' } },
        { temperature: { celsius: 26 }, local_datetime: '2024-01-02 18:00', weather: { description: 'Berawan' } },
        { temperature: { celsius: 25 }, local_datetime: '2024-01-02 21:00', weather: { description: 'Berawan' } }
      ]
    }
  ]
};

const Home = () => {
  const [activeTab, setActiveTab] = useState('Cuaca');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside search container
      if (!event.target.closest('.search-container') && showSuggestions) {
        setShowSuggestions(false);
        setSearchSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { 
        weekday: 'long', 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      };
      setCurrentTime(now.toLocaleDateString('en-US', options));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    // Load default weather data for Jakarta
    loadDefaultWeather();
    
    // Initialize with some test suggestions for debugging
    const testSuggestions = [
      { nama_desa: 'Ngringin', kecamatan: 'Mojogedang', kabupaten: 'Karanganyar', provinsi: 'Jawa Tengah', adm4: '33.13.11.2005' },
      { nama_desa: 'Ngrogot', kecamatan: 'Tulungagung', kabupaten: 'Tulungagung', provinsi: 'Jawa Timur', adm4: '35.18.01.2001' }
    ];
    setSearchSuggestions(testSuggestions);
    
    return () => clearInterval(interval);
  }, []);

  // Generate alerts when weather data changes
  useEffect(() => {
    if (weatherData) {
      const newAlerts = generateAlerts(weatherData);
      setAlerts(newAlerts);
    }
  }, [weatherData]);
  const loadDefaultWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try Jakarta Pusat - Gambir first
      const defaultAdm4 = '31.71.01.1001';
      
      try {        const data = await api.fetchWeather(defaultAdm4);
        if (data.success) {

          
          // Process the data to ensure it matches expected structure
          if (data.data.forecast && Array.isArray(data.data.forecast)) {
            const processedData = {
              ...data.data,
              forecast: data.data.forecast.map(day => {
                return {
                  ...day,
                  forecasts: Array.isArray(day.forecasts) ? day.forecasts.map(fc => ({
                    temperature: { 
                      celsius: typeof fc.temperature === 'object' ? fc.temperature.celsius : fc.temperature 
                    },
                    local_datetime: fc.local_datetime || fc.datetime || new Date().toISOString(),
                    weather: { 
                      description: fc.weather?.description || fc.description || 'Unknown'
                    }
                  })) : []
                };
              }).filter(day => day.forecasts && day.forecasts.length > 0)
            };
            
            setWeatherData(processedData);

          } else {
            // Invalid forecast structure, use as-is
            setWeatherData(data.data);
          }        } else {
          throw new Error('Backend API error');
        }
      } catch (apiError) {
        // Use mock data when backend is unavailable
        setWeatherData(mockWeatherData);
      }
    } catch (err) {
      setError('Unable to load weather data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        setLoading(true);
        setError(null);
        setShowSuggestions(false);
        

        
        // Try to search by desa name first
        const searchResponse = await fetch(`${API_BASE_URL}/api/weather/search?desa=${encodeURIComponent(searchQuery)}`);
        const searchData = await searchResponse.json();
        

        if (searchData.success && searchData.weather) {

          
          // Verify forecast data structure before setting
          if (searchData.weather.forecast && Array.isArray(searchData.weather.forecast)) {
            // Log forecast structure to debug
            
            // Make sure forecast data has the right structure
            const cleanedData = {
              ...searchData.weather,
              forecast: searchData.weather.forecast.map(day => {
                return {
                  ...day,
                  forecasts: Array.isArray(day.forecasts) ? day.forecasts.map(fc => ({
                    temperature: { 
                      celsius: typeof fc.temperature === 'object' ? fc.temperature.celsius : fc.temperature 
                    },
                    local_datetime: fc.local_datetime || fc.datetime || new Date().toISOString(),
                    weather: { 
                      description: fc.weather?.description || fc.description || 'Unknown'
                    }
                  })) : []
                };
              }).filter(day => day.forecasts && day.forecasts.length > 0)
            };
            
            setWeatherData(cleanedData);

          } else {

            setWeatherData(searchData.weather); // Set it anyway and let the UI handle fallbacks
          }
          
          setSearchQuery(''); // Clear search after successful search
        } else {
          setError(searchData.message || 'Location not found');

        }
      } catch (err) {

        setError('Failed to search location. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }
  };
  const handleSearchInput = async (value) => {
    setSearchQuery(value);
    
    // Hide suggestions when input is empty
    if (value.length === 0) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Show suggestions for any input >= 1 character
    try {
      // Try API call first (using real data from desa.json)
      const response = await fetch(`${API_BASE_URL}/api/search-desa?q=${encodeURIComponent(value)}&limit=12`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          const sortedResults = sortByRelevance(data.data, value);
          setSearchSuggestions(sortedResults.slice(0, 10));
          setShowSuggestions(true);
          return;
        }
      }
      
      // If API fails, show empty (no mock data)
      console.warn('⚠️ No API results found for:', value);
      setSearchSuggestions([]);
      setShowSuggestions(false);
      
    } catch (error) {
      console.error('❌ API Error:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Helper function to sort by relevance
  const sortByRelevance = (results, query) => {
    const queryLower = query.toLowerCase();
    
    return results.sort((a, b) => {
      // Priority 1: Exact desa name match
      const aDesaExact = a.nama_desa?.toLowerCase() === queryLower;
      const bDesaExact = b.nama_desa?.toLowerCase() === queryLower;
      if (aDesaExact && !bDesaExact) return -1;
      if (!aDesaExact && bDesaExact) return 1;
      
      // Priority 2: Desa name starts with query
      const aDesaStarts = a.nama_desa?.toLowerCase().startsWith(queryLower);
      const bDesaStarts = b.nama_desa?.toLowerCase().startsWith(queryLower);
      if (aDesaStarts && !bDesaStarts) return -1;
      if (!aDesaStarts && bDesaStarts) return 1;
      
      // Priority 3: Desa name contains query
      const aDesaContains = a.nama_desa?.toLowerCase().includes(queryLower);
      const bDesaContains = b.nama_desa?.toLowerCase().includes(queryLower);
      if (aDesaContains && !bDesaContains) return -1;
      if (!aDesaContains && bDesaContains) return 1;
      
      // Priority 4: Alphabetical by desa name
      return (a.nama_desa || '').localeCompare(b.nama_desa || '');
    });
  };

  const highlightMatch = (text, query) => {
    if (!text || !query) return text;
    
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(queryLower);
    
    if (index === -1) return text;
    
    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);
    
    return (
      <>
        {before}
        <span className="bg-yellow-400/30 text-yellow-200 font-semibold px-1 rounded">
          {match}
        </span>
        {after}
      </>
    );
  };

  const getMatchScore = (item, query) => {
    const queryLower = query.toLowerCase();
    const desaLower = item.nama_desa?.toLowerCase() || '';
    
    if (desaLower === queryLower) return 100;
    if (desaLower.startsWith(queryLower)) return 90;
    if (desaLower.includes(queryLower)) return 70;
    if (item.kecamatan?.toLowerCase().includes(queryLower)) return 50;
    if (item.kabupaten?.toLowerCase().includes(queryLower)) return 30;
    return 0;
  };

  const selectSuggestion = (suggestion) => {
    // Force immediate state update
    setShowSuggestions(false);
    setSearchSuggestions([]);
    
    // Set search query to just the village name (cleaner)
    setSearchQuery(suggestion.nama_desa);
    
    // Load weather data for the selected location immediately
    handleSearch();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  // Get current weather data
  // Get current weather from the new API structure
  const getCurrentWeather = () => {
    // Check if we have the new API structure
    if (weatherData?.data && weatherData.data[0]?.cuaca) {
      // Get the first (current) forecast from the new API structure
      const firstDay = weatherData.data[0].cuaca[0];
      if (Array.isArray(firstDay) && firstDay.length > 0) {
        const current = firstDay[0]; // First forecast is the current one
        return {
          temperature: { 
            celsius: current.t || 25, 
            fahrenheit: Math.round((current.t || 25) * 9/5 + 32)
          },
          weather: { description: current.weather_desc || 'Loading...' },
          wind: { 
            speed: current.ws || 0, 
            direction: current.wd || 'N' 
          },
          humidity: current.hu || 50
        };
      }
    }
    
    // Fallback to existing currentWeather or default
    return weatherData?.currentWeather || {
      temperature: { celsius: 25, fahrenheit: 77 },
      weather: { description: 'Loading...' },
      wind: { speed: 0, direction: 'N' },
      humidity: 50
    };
  };

  const currentWeather = getCurrentWeather();

  const location = weatherData?.lokasi || {
    desa: 'Loading...',
    kecamatan: '...',
    kabupaten: '...',
    provinsi: '...'
  };

  // Weather icon helper function - define early to avoid initialization errors
  const getWeatherIcon = (description) => {
    if (!description) return '⛅';
    
    // Convert to string and handle different data types
    let desc = '';
    if (typeof description === 'string') {
      desc = description.toLowerCase();
    } else if (typeof description === 'object' && description.description) {
      desc = description.description.toLowerCase();
    } else {
      desc = String(description).toLowerCase();
    }
    
    // Specific check for "Cerah Berawan" - partly cloudy (sun with some clouds)
    if (desc.includes('cerah berawan') || desc.includes('partly cloudy')) return '⛅';
    
    // Pure "Cerah" - clear/sunny
    if (desc.includes('cerah') || desc.includes('clear') || desc.includes('sunny')) return '☀️';
    
    // Pure "Berawan" - mostly/fully cloudy (just clouds)
    if (desc.includes('berawan') || desc.includes('mostly cloudy') || desc.includes('cloudy')) return '☁️';
    
    // Weather conditions
    if (desc.includes('hujan') || desc.includes('rain')) return '🌧️';
    if (desc.includes('badai') || desc.includes('storm')) return '⛈️';
    if (desc.includes('kabut') || desc.includes('fog')) return '🌫️';
    if (desc.includes('petir') || desc.includes('thunder')) return '⛈️';
    
    return '🌤️'; // Default: sun behind small cloud
  };  // Chart data for the temperature line chart
  const getChartData = () => {
    const chartData = getChartWeatherData();
    return chartData.map(item => item.temperature);
  };
  // Get chart weather data (temperature, time, and weather description)
  const getChartWeatherData = () => {
    // Check if we have the new API structure
    if (weatherData?.data && weatherData.data[0]?.cuaca) {
      const allForecasts = [];
      
      // Extract forecasts from the new API structure
      weatherData.data[0].cuaca.forEach(dayArray => {
        if (Array.isArray(dayArray)) {
          dayArray.forEach(forecast => {
            allForecasts.push({
              temperature: forecast.t || 25, // 't' field from API
              datetime: forecast.local_datetime || forecast.datetime,
              weather: forecast.weather_desc || 'Cerah', // 'weather_desc' field from API
              humidity: forecast.hu,
              wind_speed: forecast.ws
            });
          });
        }
      });
      
      // Sort forecasts by datetime
      allForecasts.sort((a, b) => {
        return new Date(a.datetime) - new Date(b.datetime);
      });
      
      // Take the next 8 forecasts (covering 24 hours, each 3 hours apart)
      return allForecasts.slice(0, 8);
    }
    
    // Fallback: Check for old structure
    if (weatherData?.forecast && weatherData.forecast.length > 0) {
      const allForecasts = [];
      
      // Get forecasts from each day and combine them
      weatherData.forecast.forEach(day => {
        if (day?.forecasts && day.forecasts.length > 0) {
          day.forecasts.forEach(forecast => {
            const datetime = forecast.local_datetime || forecast.datetime;
            if (datetime) {
              const temp = typeof forecast.temperature === 'object' ? 
                forecast.temperature.celsius : 
                forecast.temperature;
                
              if (temp !== undefined && temp !== null) {
                allForecasts.push({
                  temperature: parseInt(temp, 10) || 0,
                  datetime: datetime,
                  weather: forecast.weather || 'Cerah',
                  humidity: forecast.humidity,
                  wind_speed: forecast.wind_speed
                });
              }
            }
          });
        }
      });
      
      // Sort forecasts by datetime
      allForecasts.sort((a, b) => {
        return new Date(a.datetime) - new Date(b.datetime);
      });
      
      // Take the next 8 forecasts (covering 24 hours, each 3 hours apart)
      return allForecasts.slice(0, 8);
    }
    
    // Default data if no weather data available
    const defaultTimes = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '00:00', '03:00'];
    return defaultTimes.map((time, index) => ({
      temperature: [25, 23, 27, 29, 32, 28, 26, 24][index],
      datetime: new Date().toISOString(),
      weather: 'Cerah',
      time: time
    }));
  };

  const getTimeLabels = () => {
    const chartData = getChartWeatherData();
    return chartData.map(item => {
      if (item.time) return item.time; // Use default time if available
      
      try {
        const datetime = new Date(item.datetime);
        if (isNaN(datetime.getTime())) {
          return 'N/A';
        }
        // Format as HH:MM
        return datetime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
      } catch (e) {
        return 'N/A';
      }
    });
  };

  const chartOptions = {
    chart: {
      type: 'line',
      background: 'transparent',
      toolbar: { show: false },
      sparkline: { enabled: true }
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#A78BFA']
    },
    markers: {
      size: 6,
      colors: ['#A78BFA'],
      strokeColors: '#A78BFA',
      strokeWidth: 2
    },    tooltip: {
      enabled: true,
      theme: 'dark',
      x: { show: false },
      y: {
        formatter: function(value, { seriesIndex, dataPointIndex }) {
          const times = getTimeLabels();
          const time = times[dataPointIndex] || `${dataPointIndex*3}:00`;
          return `${value}° at ${time}`;
        }
      }
    },
    grid: { show: false },
    xaxis: { 
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { 
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    }
  };
  const chartSeries = [{
    name: 'Temperature',
    data: getChartData()
  }];

  return (
    <div className="min-h-screen flex flex-col relative" style={{ 
      fontFamily: 'Roboto, sans-serif',
      color: '#E0E0E0'
    }}>
      {/* Weather Video Background */}
      <WeatherVideoBackground 
        weatherType={weatherData?.currentWeather?.weather?.description}
        isVisible={!loading && weatherData}
      />
      {/* Background Overlay - Lighter for better video visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-purple-900/10 to-slate-900/20 z-10"></div>
      
      {/* Alert Banner - Above everything */}
      <AlertBanner alerts={alerts} />
      
      {/* Content Container */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-3 px-4 sm:py-4 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-black/20 backdrop-blur-md sticky top-0 z-50 border-b border-gray-700/50 gap-3 sm:gap-0">
          <div className="flex items-center justify-center sm:justify-start">
            <img 
              src="/logo.png" 
              alt="Logo"
              className="w-7 h-7 sm:w-8 sm:h-8"
            />
            <span className="ml-2 text-xl sm:text-2xl font-bold text-white">HujanGakYa</span>
          </div>
          
          <div className="flex-1 max-w-full sm:max-w-md sm:mx-4">
            <div className="search-container relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input 
                className="w-full bg-gray-700 bg-opacity-50 text-white placeholder-gray-400 pl-10 pr-4 py-2.5 sm:py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                placeholder="Masukkan nama desa, kecamatan, atau kota..."
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => {
                  setShowSuggestions(true);
                  // If no query, trigger search to show initial suggestions
                  if (searchQuery.length === 0) {
                    handleSearchInput('');
                  }
                }}
                onBlur={(e) => {
                  // Check if the click is inside suggestions dropdown
                  const isClickingInsideDropdown = e.relatedTarget && 
                    e.relatedTarget.closest('.search-suggestions-dropdown');
                  
                  if (!isClickingInsideDropdown) {
                    setTimeout(() => {
                      setShowSuggestions(false);
                      setSearchSuggestions([]);
                    }, 150);
                  }
                }}
                disabled={loading}
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            
              {/* Search Suggestions - Only show when we have both suggestions AND showSuggestions is true */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="search-suggestions-dropdown absolute top-full left-0 right-0 mt-1 bg-gray-800/95 backdrop-blur-sm rounded-lg border border-gray-600 shadow-xl z-[60] max-h-64 sm:max-h-80 overflow-y-auto">
                  
                  {/* Search Results Header */}
                  <div className="px-3 sm:px-4 py-2 bg-gray-700/50 border-b border-gray-600">
                    <span className="text-xs text-gray-300 font-medium">
                      🔍 {searchSuggestions.length} hasil ditemukan 
                      {searchQuery && ` untuk "${searchQuery}"`}
                    </span>
                  </div>

                  {/* Simple Results List */}
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-700/70 cursor-pointer border-b border-gray-600/30 last:border-b-0 transition-colors duration-150"
                      onMouseDown={(e) => {
                        // Prevent blur event when clicking suggestion
                        e.preventDefault();
                        selectSuggestion(suggestion);
                      }}
                      onClick={(e) => {
                        // Additional onClick handler
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          <span className="text-blue-300 text-xs sm:text-sm">📍</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white mb-1 text-sm sm:text-base">
                            {searchQuery ? highlightMatch(suggestion.nama_desa, searchQuery) : suggestion.nama_desa}
                          </div>
                          
                          <div className="text-xs sm:text-sm text-gray-400">
                            <span>{suggestion.kecamatan}</span>
                            <span className="text-gray-500 mx-1 sm:mx-2">•</span>
                            <span>{suggestion.kabupaten}</span>
                          </div>
                          
                          <div className="text-xs text-gray-500 mt-1">
                            {suggestion.provinsi}
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 ml-2">
                          <div className="text-xs text-gray-500 text-right">
                            {searchQuery ? getMatchScore(suggestion, searchQuery) : 100}% match
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* No Results Message */}
                  {searchSuggestions.length === 0 && searchQuery.length >= 2 && (
                    <div className="px-3 sm:px-4 py-4 sm:py-6 text-center">
                      <div className="text-gray-400 mb-2">❓</div>
                      <div className="text-xs sm:text-sm text-gray-300 mb-1">Tidak ada hasil ditemukan</div>
                      <div className="text-xs text-gray-500">
                        Coba kata kunci lain atau periksa ejaan
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">{currentTime}</span>
            <button className="text-gray-300 hover:text-white">
            </button>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-grow p-3 sm:p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
          
            {/* Hero Section */}
            <section className="mb-6 sm:mb-8">
              <div className="w-full">
                {/* Main Temperature Display - Mobile Optimized */}
                <div className="w-full">
                  <div className="flex flex-col md:flex-row items-start justify-between">
                    <div className="w-full md:w-auto flex flex-col items-center md:items-start mb-6 md:mb-0">
                      
                      {/* Mobile: Centered Layout */}
                      <div className="flex flex-col items-center md:flex-row md:items-start">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mb-3 md:mb-0 md:mr-4 text-5xl sm:text-6xl md:text-7xl flex items-center justify-center">
                          {getWeatherIcon(currentWeather.weather?.description)}
                        </div>
                        
                        <div className="flex flex-col items-center md:items-start">
                          <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white text-center md:text-left">
                            {currentWeather.temperature?.celsius || '--'}°
                          </span>
                          
                          {/* Weather Description - Mobile: Below Temperature */}
                          <p className="text-base sm:text-lg md:text-xl text-white font-medium mt-2 md:hidden text-center">
                            {currentWeather.weather?.description || 'No data available'}
                          </p>
                          
                          {/* Wind Speed & Humidity - Desktop: Right of Temperature */}
                          <div className="hidden md:flex items-center space-x-6 mt-4">
                            <div className="flex items-center">
                              <span className="text-lg mr-2">💨</span>
                              <div className="text-white">
                                <span className="text-base font-medium">{currentWeather.wind?.speed || '11.3'}</span>
                                <span className="text-xs text-white/70 ml-1">km/h</span>
                              </div>
                            </div>
                            
                            <div className="w-px h-5 bg-white/40"></div>
                            
                            <div className="flex items-center">
                              <span className="text-lg mr-2">💧</span>
                              <div className="text-white">
                                <span className="text-base font-medium">{currentWeather.humidity || '58'}</span>
                                <span className="text-xs text-white/70 ml-1">%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                        
                      {/* Wind Speed & Humidity - Mobile Only: Centered Below */}
                      <div className="flex md:hidden items-center justify-center space-x-6 sm:space-x-8 mt-4 w-full">
                        <div className="flex items-center">
                          <span className="text-lg sm:text-xl mr-2">💨</span>
                          <div className="text-white text-center">
                            <span className="text-sm sm:text-base font-medium">{currentWeather.wind?.speed || '3.7'}</span>
                            <span className="text-xs text-white/70 ml-1">km/h</span>
                          </div>
                        </div>
                        
                        <div className="w-px h-5 bg-white/40"></div>
                        
                        <div className="flex items-center">
                          <span className="text-lg sm:text-xl mr-2">💧</span>
                          <div className="text-white text-center">
                            <span className="text-sm sm:text-base font-medium">{currentWeather.humidity || '78'}</span>
                            <span className="text-xs text-white/70 ml-1">%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  
                    <div className="w-full md:w-auto text-center md:text-right space-y-3 sm:space-y-4">
                      {/* Location Header - Mobile: Centered, Desktop: Right */}
                      <div className="text-center md:text-right">
                        {/* Weather Description - Desktop Only */}
                        <p className="hidden md:block text-lg md:text-xl text-white font-medium mb-2">
                          {currentWeather.weather?.description || 'No data available'}
                        </p>
                        
                        {/* Location Name */}
                        <div className="flex items-center justify-center md:justify-end">
                          <span className="text-red-500 mr-2">📍</span>
                          <h1 className="text-base sm:text-lg md:text-xl font-semibold text-white">
                            {location.desa?.toUpperCase() || 'SELECT LOCATION'}
                            {location.provinsi && `, ${location.provinsi?.toUpperCase()}`}
                          </h1>
                        </div>
                      </div>
                      
                      {/* Location Details - Mobile: Full Width, Desktop: Bottom Right */}
                      {location.desa && (
                        <div className="backdrop-blur-xl bg-white/20 rounded-xl p-3 sm:p-4 border border-white/30 shadow-xl">
                          <h3 className="text-white font-semibold mb-3 flex items-center justify-center md:justify-start text-xs sm:text-sm drop-shadow">
                            <span className="mr-2">🏢</span>
                            Location Details
                          </h3>
                          <div className="text-xs sm:text-sm text-white/80 space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-white/60 font-medium">Desa:</span>
                              <span className="text-right">{location.desa}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60 font-medium">Kecamatan:</span>
                              <span className="text-right">{location.kecamatan}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60 font-medium">Kabupaten:</span>
                              <span className="text-right">{location.kotkab || location.kabupaten}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60 font-medium">Provinsi:</span>
                              <span className="text-right">{location.provinsi}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="backdrop-blur-xl bg-red-500/20 border border-red-400/30 rounded-xl p-4 mb-4 shadow-xl">
                  <div className="flex items-center">
                    <span className="text-red-300 mr-2">⚠️</span>
                    <p className="text-red-200 drop-shadow">{error}</p>
                  </div>
                </div>
              )}

              {!loading && !error && (
                <div className="relative w-full">
                  <div className="h-64 sm:h-72 md:h-80 mt-28 mb-3 w-full">
                    <Chart 
                      options={chartOptions}
                      series={chartSeries}
                      type="line"
                      height="100%"
                      width="100%"
                    />
                  </div>
                
                  {/* Temperature labels below chart with weather icons */}
                  <div className="grid grid-cols-8 gap-1 sm:gap-2 px-1">
                    {(() => {
                      const chartWeatherData = getChartWeatherData();
                    
                      return chartWeatherData.map((dataPoint, index) => (
                        <div key={index} className="text-center">
                          <div className="text-sm sm:text-base mb-1">
                            {getWeatherIcon(dataPoint.weather)}
                          </div>
                          <p className="text-xs text-white/90 mb-1 font-semibold drop-shadow">
                            {dataPoint.temperature}°
                          </p>
                          <p className="text-xs text-white/70 drop-shadow">
                            {dataPoint.time || (() => {
                              try {
                                const datetime = new Date(dataPoint.datetime);
                                return datetime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
                              } catch (e) {
                                return `${index*3}:00`;
                              }
                            })()}
                          </p>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </section>          {/* Weekly Forecast Section - Liquid Glass */}
            <section className="backdrop-blur-xl bg-white/20 p-3 sm:p-4 rounded-xl shadow-xl border border-white/30">
              {/* Tab Navigation - Mobile Optimized */}
              <div className="relative border-b border-white/20 mb-3 sm:mb-4">
                <div className="flex overflow-x-auto scrollbar-hide gap-0 pb-2 -mb-2">
                  {['Cuaca', 'Peringatan', 'Lokasi'].map((tab) => (
                    <button
                      key={tab}
                      className={`flex-1 min-w-0 py-3 sm:py-2 px-2 sm:px-4 text-sm sm:text-base font-semibold focus:outline-none transition-all duration-300 rounded-t-lg ${
                        activeTab === tab
                          ? 'text-white border-b-2 border-white bg-white/20'
                          : 'text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15'
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                
                {/* Remove scroll indicators on mobile for cleaner look */}
              </div>

              {/* Tab Content */}
              {activeTab === 'Cuaca' && (
                <div className="space-y-3 sm:space-y-4">
                  {/* Current Weather Summary - BMKG Data */}
                  <div className="backdrop-blur-xl bg-white/20 rounded-xl p-3 sm:p-4 border border-white/30">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 text-center sm:text-left">Data Cuaca Saat Ini (BMKG)</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {/* Temperature (t field) */}
                      <div className="text-center py-2 sm:py-0">
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                          {currentWeather.temperature?.celsius || '--'}°C
                        </div>
                        <div className="text-sm text-white/70">🌡️ Suhu</div>
                      </div>
                      
                      {/* Weather Description (weather_desc field) */}
                      <div className="text-center py-2 sm:py-0">
                        <div className="text-2xl mb-1">
                          {getWeatherIcon(currentWeather.weather?.description)}
                        </div>
                        <div className="text-sm text-white/90 font-medium">
                          {currentWeather.weather?.description || 'Loading...'}
                        </div>
                        <div className="text-xs text-white/60">Kondisi Cuaca</div>
                      </div>
                      
                      {/* Wind Speed (ws field) */}
                      <div className="text-center py-2 sm:py-0">
                        <div className="text-xl sm:text-2xl font-bold text-green-200 mb-1">
                          {currentWeather.wind?.speed || '--'} km/h
                        </div>
                        <div className="text-sm text-white/70">💨 Kec. Angin</div>
                      </div>
                    </div>
                  </div>

                  {/* Humidity Detail with Progress Bar */}
                  <div className="backdrop-blur-xl bg-white/20 rounded-xl p-4 sm:p-6 border border-white/30">
                    <h3 className="text-white font-semibold mb-4 flex items-center justify-center">
                      <span className="mr-2">💧</span>
                      Kelembaban Udara
                    </h3>
                    <div className="text-center">
                      <div className="text-6xl font-bold text-white mb-4">
                        {currentWeather.humidity || '46'}%
                      </div>
                      <div className="text-sm text-white/70 mb-4">
                        Kategori: Normal
                      </div>
                      
                      {/* Humidity Progress Bar */}
                      <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${currentWeather.humidity || 46}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Hourly Forecast 3 Days - Scrollable */}
                  <div className="backdrop-blur-xl bg-white/20 rounded-xl p-4 border border-white/30">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <span className="mr-2">📊</span>
                      Prakiraan Detail 3 Hari
                    </h3>
                    
                    <div className="overflow-x-auto hourly-forecast">
                      <div className="flex gap-2 sm:gap-3 pb-2" style={{ minWidth: 'fit-content' }}>
                        {(() => {
                          // Process BMKG API data structure
                          const allForecasts = [];
                          
                          // Extract data from BMKG API format
                          if (weatherData?.data && Array.isArray(weatherData.data) && weatherData.data[0]?.cuaca) {
                            const cuacaData = weatherData.data[0].cuaca;
                            
                            // Process each day (3 days total)
                            cuacaData.forEach((dayArray, dayIndex) => {
                              if (Array.isArray(dayArray)) {
                                dayArray.forEach(forecast => {
                                  if (forecast && forecast.t !== undefined && forecast.weather_desc) {
                                    allForecasts.push({
                                      temperature: forecast.t,
                                      datetime: forecast.local_datetime || forecast.datetime,
                                      weather: forecast.weather_desc,
                                      humidity: forecast.hu,
                                      wind_speed: forecast.ws,
                                      dayIndex: dayIndex
                                    });
                                  }
                                });
                              }
                            });
                          }
                          
                          // If no API data, create demo data to show the interface
                          if (allForecasts.length === 0) {
                            const now = new Date();
                            for (let i = 0; i < 20; i++) {
                              const forecastTime = new Date(now.getTime() + i * 3 * 60 * 60 * 1000);
                              allForecasts.push({
                                temperature: Math.round(25 + Math.random() * 8),
                                datetime: forecastTime.toISOString(),
                                weather: i < 8 ? 'Cerah' : i < 16 ? 'Cerah Berawan' : 'Berawan',
                                humidity: Math.round(50 + Math.random() * 30),
                                wind_speed: Math.round(2 + Math.random() * 8),
                                dayIndex: Math.floor(i / 8)
                              });
                            }
                          }
                          
                          // Sort by datetime
                          allForecasts.sort((a, b) => {
                            try {
                              return new Date(a.datetime) - new Date(b.datetime);
                            } catch (e) {
                              return 0;
                            }
                          });
                          
                          return allForecasts.map((dataPoint, index) => {
                            return (
                              <div key={index} className="flex-shrink-0">
                                
                                <div className="bg-white/15 rounded-lg p-2 sm:p-3 text-center w-[75px] sm:w-[85px] h-[120px] sm:h-[140px] backdrop-blur-sm border border-white/30 hover:bg-white/20 transition-all duration-200 flex flex-col justify-between">
                                  <div className="text-xs sm:text-sm text-white/90 font-semibold">
                                    {(() => {
                                      try {
                                        const datetime = new Date(dataPoint.datetime);
                                        return datetime.toLocaleTimeString('en-US', { 
                                          hour: 'numeric', 
                                          hour12: true 
                                        });
                                      } catch (e) {
                                        const hour = (index % 8) * 3 + 6;
                                        return hour >= 12 ? `${hour > 12 ? hour - 12 : hour} PM` : `${hour} AM`;
                                      }
                                    })()}
                                  </div>
                                  
                                  <div className="text-lg sm:text-xl flex-grow flex items-center justify-center">
                                    {getWeatherIcon(dataPoint.weather)}
                                  </div>
                                  
                                  <div className="text-sm sm:text-lg font-bold text-white drop-shadow-lg">
                                    {Math.round(dataPoint.temperature)}°C
                                  </div>
                                  
                                  <div className="text-xs space-y-1">
                                    <div className="text-blue-100 font-semibold drop-shadow">
                                      💧 {Math.round(dataPoint.humidity)}%
                                    </div>
                                    <div className="text-green-100 font-semibold drop-shadow">
                                      💨 {Math.round(dataPoint.wind_speed)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                    
                    {loading && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                        <p className="text-white/70 text-sm">Memuat data prakiraan...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab Peringatan - Smart Weather Alerts */}
              {activeTab === 'Peringatan' && (
                <div className="space-y-4">
                  {(() => {
                    // Analyze BMKG data for weather warnings
                    const analyzeWeatherWarnings = () => {
                      const warnings = [];
                      
                      if (weatherData?.data && weatherData.data[0]?.cuaca) {
                        const allForecasts = [];
                        
                        // Collect all forecasts
                        weatherData.data[0].cuaca.forEach((dayArray) => {
                          if (Array.isArray(dayArray)) {
                            dayArray.forEach(forecast => {
                              if (forecast) {
                                allForecasts.push({
                                  datetime: forecast.local_datetime || forecast.datetime,
                                  weather_desc: forecast.weather_desc,
                                  wind_speed: forecast.ws,
                                  temperature: forecast.t,
                                  humidity: forecast.hu,
                                  tp: forecast.tp // precipitation
                                });
                              }
                            });
                          }
                        });

                        // Check for Strong Wind Warning (>15 km/h)
                        const strongWindForecasts = allForecasts.filter(f => f.wind_speed > 15);
                        if (strongWindForecasts.length > 0) {
                          const maxWind = Math.max(...strongWindForecasts.map(f => f.wind_speed));
                          warnings.push({
                            type: 'wind',
                            level: maxWind > 25 ? 'high' : 'medium',
                            title: 'PERINGATAN! ANGIN KENCANG',
                            speed: maxWind,
                            forecasts: strongWindForecasts
                          });
                        }

                        // Check for Rain Potential
                        const rainForecasts = allForecasts.filter(f => 
                          f.weather_desc && (
                            f.weather_desc.toLowerCase().includes('hujan') ||
                            (f.tp && f.tp > 0)
                          )
                        );
                        
                        if (rainForecasts.length > 0) {
                          // Calculate rain duration
                          const firstRain = rainForecasts[0];
                          const lastRain = rainForecasts[rainForecasts.length - 1];
                          
                          warnings.push({
                            type: 'rain',
                            level: rainForecasts.some(f => f.weather_desc?.toLowerCase().includes('lebat')) ? 'high' : 'medium',
                            title: 'POTENSI HUJAN',
                            startTime: firstRain.datetime,
                            endTime: lastRain.datetime,
                            forecasts: rainForecasts,
                            totalHours: rainForecasts.length * 3 // assuming 3-hour intervals
                          });
                        }

                        // Check for Extreme Temperature
                        const hotForecasts = allForecasts.filter(f => f.temperature > 35);
                        if (hotForecasts.length > 0) {
                          warnings.push({
                            type: 'heat',
                            level: 'medium',
                            title: 'CUACA PANAS',
                            maxTemp: Math.max(...hotForecasts.map(f => f.temperature)),
                            forecasts: hotForecasts
                          });
                        }
                      }
                      
                      return warnings;
                    };

                    const warnings = analyzeWeatherWarnings();

                    return (
                      <>
                        {warnings.length === 0 ? (
                          /* No Warnings - Normal Conditions */
                          <div className="backdrop-blur-xl bg-green-900/30 rounded-xl p-6 border border-green-400/30 text-center">
                            <div className="text-5xl mb-4">✅</div>
                            <h3 className="text-xl font-bold text-green-200 mb-2">Kondisi Cuaca Normal</h3>
                            <p className="text-white/80 text-sm">
                              Tidak ada peringatan cuaca yang dikeluarkan BMKG saat ini.
                            </p>
                            <p className="text-green-200/70 text-xs mt-2">
                              Tetap pantau kondisi cuaca secara berkala
                            </p>
                          </div>
                        ) : (
                          /* Display Warnings */
                          <div className="space-y-3">
                            {warnings.map((warning, index) => (
                              <div key={index} className={`backdrop-blur-xl rounded-xl p-4 border ${
                                warning.type === 'wind' ? 'bg-orange-900/40 border-orange-400/40' :
                                  warning.type === 'rain' ? 'bg-blue-900/40 border-blue-400/40' :
                                    warning.type === 'heat' ? 'bg-red-900/40 border-red-400/40' :
                                      'bg-yellow-900/40 border-yellow-400/40'
                              }`}>
                                <div className="flex items-start gap-3">
                                  <div className="text-2xl">
                                    {warning.type === 'wind' ? '💨' :
                                      warning.type === 'rain' ? '🌧️' :
                                        warning.type === 'heat' ? '🌡️' : '⚠️'}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className={`font-bold text-lg mb-2 ${
                                      warning.type === 'wind' ? 'text-orange-200' :
                                        warning.type === 'rain' ? 'text-blue-200' :
                                          warning.type === 'heat' ? 'text-red-200' :
                                            'text-yellow-200'
                                    }`}>
                                      {warning.title}
                                    </h4>
                                    
                                    {warning.type === 'wind' && (
                                      <div className="space-y-1">
                                        <p className="text-white/90 font-medium">
                                          Kecepatan Angin: <span className="text-orange-300">{warning.speed} km/jam</span>
                                        </p>
                                        <p className="text-white/70 text-sm">
                                          {warning.level === 'high' ? '⚠️ Tinggi - Hindari aktivitas outdoor' : '⚠️ Sedang - Berhati-hati saat beraktivitas'}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {warning.type === 'rain' && (
                                      <div className="space-y-1">
                                        <p className="text-white/90 font-medium">
                                          Prakiraan hujan dari jam{' '}
                                          <span className="text-blue-300">
                                            {(() => {
                                              try {
                                                return new Date(warning.startTime).toLocaleTimeString('id-ID', {
                                                  hour: '2-digit',
                                                  minute: '2-digit'
                                                });
                                              } catch (e) {
                                                return '15:00';
                                              }
                                            })()} 
                                          </span>
                                          {' hingga '}
                                          <span className="text-blue-300">
                                            {(() => {
                                              try {
                                                return new Date(warning.endTime).toLocaleTimeString('id-ID', {
                                                  hour: '2-digit',
                                                  minute: '2-digit'
                                                });
                                              } catch (e) {
                                                return '18:00';
                                              }
                                            })()}
                                          </span>
                                        </p>
                                        <p className="text-white/70 text-sm">
                                          ☔ Durasi: ~{warning.totalHours} jam • Siapkan payung/jas hujan
                                        </p>
                                      </div>
                                    )}
                                    
                                    {warning.type === 'heat' && (
                                      <div className="space-y-1">
                                        <p className="text-white/90 font-medium">
                                          Suhu Maksimal: <span className="text-red-300">{warning.maxTemp}°C</span>
                                        </p>
                                        <p className="text-white/70 text-sm">
                                          🌡️ Cuaca panas - Perbanyak minum air, hindari sinar matahari langsung
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                  
                  {/* Quick Action Tips */}
                  <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20">
                    <h3 className="text-white font-semibold mb-3 flex items-center text-sm">
                      <span className="mr-2">�</span>
                      Tips Siaga Cuaca
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span>📱</span>
                          <span className="text-white/80">Pantau update cuaca berkala</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>☂️</span>
                          <span className="text-white/80">Siapkan payung/jas hujan</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span>🏠</span>
                          <span className="text-white/80">Amankan barang di luar rumah</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🚗</span>
                          <span className="text-white/80">Hati-hati berkendara</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Lokasi - Map Only */}
              {activeTab === 'Lokasi' && (
                <div className="space-y-4">
                  {weatherData && weatherData.lokasi ? (
                    <>
                      {/* Map View */}
                      <div className="backdrop-blur-md bg-white/20 rounded-xl p-4 border border-white/20">
                        <MapView data={weatherData.lokasi.lat && weatherData.lokasi.lon ? [{
                          data: {
                            lokasi: weatherData.lokasi,
                            data: [{
                              value: weatherData.currentWeather?.temperature?.celsius,
                              weather: weatherData.currentWeather?.weather?.description,
                              datetime: new Date().toISOString()
                            }]
                          },
                          location: weatherData.lokasi.desa,
                          adm4: weatherData.lokasi.adm4 || 'Unknown'
                        }] : []} />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-white/70 mb-4">
                        <span className="text-4xl">📍</span>
                      </div>
                      <p className="text-white/80 drop-shadow">Search for a location to view map details</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          
          </div>
        </main>
      
        {/* Footer */}
        <footer className="text-center py-4 sm:py-6 px-4 text-xs sm:text-sm text-white/70 backdrop-blur-xl bg-white/10 border-t border-white/20">
          <p>Weather data powered by BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) Indonesia</p>
        </footer>
      
      </div>
    </div>
  );
};

export default Home;
