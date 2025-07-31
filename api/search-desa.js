module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        error: 'Missing search query',
        message: 'Please provide search query parameter "q"'
      });
    }

    // Try to load real desa controller
    let desaData;
    try {
      const DesaController = require('../backend/controllers/desaController');
      const desaController = new DesaController();
      
      // Create mock req/res objects for controller
      const mockReq = { query: { q, limit } };
      const mockRes = {
        json: (data) => { desaData = data; },
        status: function(code) { 
          this.statusCode = code;
          return this;
        },
        statusCode: 200
      };
      
      await desaController.searchDesa(mockReq, mockRes);
      
      if (mockRes.statusCode === 200 && desaData) {
        return res.status(200).json(desaData);
      }
      
    } catch (controllerError) {
      console.log('Controller not available, using mock data:', controllerError.message);
    }

    // Fallback to mock data
    const mockDesaData = {
      results: [
        {
          nama_desa: `${q} Desa`,
          kode_adm4: '31.73.08.1001',
          kecamatan: 'Kecamatan Sample',
          kabupaten: 'Kabupaten Sample',
          provinsi: 'DKI Jakarta',
          lat: -6.2,
          lon: 106.8
        }
      ],
      total: 1,
      query: q,
      source: 'mock_data'
    };

    res.status(200).json(mockDesaData);
    
  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};
