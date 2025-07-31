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

    // Mock weather data untuk testing
    const mockWeatherData = [
      {
        location: 'Jakarta Barat',
        adm4: adm4,
        temperature: 28,
        humidity: 65,
        description: 'Berawan Sebagian',
        lat: -6.1754,
        lon: 106.8272,
        timestamp: new Date().toISOString()
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
