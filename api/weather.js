module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { adm4 } = req.query;
    
    if (!adm4) {
      return res.status(400).json({
        error: 'Missing adm4 parameter',
        message: 'Please provide adm4 code (example: 31.73.08.1001)'
      });
    }

    // Try to load real weather controller
    let weatherData;
    try {
      const WeatherController = require('../backend/controllers/weatherController');
      const weatherController = new WeatherController();
      
      // Create mock req/res objects for controller
      const mockReq = { query: { adm4 } };
      const mockRes = {
        json: (data) => { weatherData = data; },
        status: function(code) { 
          this.statusCode = code;
          return this;
        },
        statusCode: 200
      };
      
      await weatherController.getWeatherByAdm4(mockReq, mockRes);
      
      if (mockRes.statusCode === 200 && weatherData) {
        return res.status(200).json(weatherData);
      }
      
    } catch (controllerError) {
      console.log('Controller not available, using mock data:', controllerError.message);
    }

    // Fallback to enhanced mock data
    const mockWeatherData = [
      {
        location: `Location for ${adm4}`,
        adm4: adm4,
        temperature: Math.floor(Math.random() * 10) + 25, // 25-35°C
        humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
        description: ['Cerah', 'Berawan', 'Hujan Ringan', 'Berawan Sebagian'][Math.floor(Math.random() * 4)],
        lat: -6.2 + (Math.random() * 4), // Random lat around Indonesia
        lon: 106.8 + (Math.random() * 10), // Random lon around Indonesia
        wind_speed: Math.floor(Math.random() * 15) + 5,
        timestamp: new Date().toISOString(),
        source: 'mock_data'
      }
    ];

    res.status(200).json(mockWeatherData);
    
  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};
