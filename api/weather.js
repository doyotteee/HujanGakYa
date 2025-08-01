const fs = require('fs').promises;
const path = require('path');

// BMKG API Service function
const getBMKGWeatherData = async (adm4Code) => {
  try {
    const bmkgUrl = `https://cuaca-gempa-rest-api.vercel.app/weather/${adm4Code}`;
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(bmkgUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'HujanGakYa/1.0',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`BMKG API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('BMKG API Error:', error.message);
    throw error;
  }
};

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { adm4, desa, q } = req.query;
    
    let targetAdm4 = adm4;
    let villageInfo = null;

    // Jika ada parameter desa atau q, cari kode ADM4 berdasarkan nama desa
    if (!adm4 && (desa || q)) {
      const query = desa || q;
      console.log(`🔍 Searching ADM4 for desa: "${query}"`);
      
      try {
        // Load desa data dari file JSON (dalam konteks Vercel, kita perlu path relatif)
        const desaDataPath = path.join(process.cwd(), 'backend/data/desa.json');
        const desaDataRaw = await fs.readFile(desaDataPath, 'utf8');
        const villages = JSON.parse(desaDataRaw);
        
        // Cari desa berdasarkan nama
        const matchedVillages = villages.filter(village => {
          const searchText = query.toLowerCase();
          return (
            village.nama_desa.toLowerCase().includes(searchText) ||
            village.kecamatan.toLowerCase().includes(searchText) ||
            village.kabupaten.toLowerCase().includes(searchText)
          );
        });

        if (matchedVillages.length === 0) {
          return res.status(404).json({
            success: false,
            message: `Tidak ditemukan desa dengan nama "${query}"`,
            suggestion: 'Coba gunakan nama yang lebih spesifik atau periksa ejaan',
            example: '/api/weather?desa=ngringo atau /api/weather?q=jakarta'
          });
        }

        // Ambil desa pertama
        villageInfo = matchedVillages[0];
        targetAdm4 = villageInfo.kode_desa;
        
        console.log(`✅ Found ADM4: ${targetAdm4} for "${villageInfo.nama_desa}"`);
      } catch (fileError) {
        console.error('Error loading desa data:', fileError.message);
        return res.status(500).json({
          success: false,
          message: 'Error loading village data',
          error: fileError.message
        });
      }
    }

    // Validasi ADM4 code
    if (!targetAdm4) {
      return res.status(400).json({
        success: false,
        message: 'Parameter adm4, desa, atau q diperlukan',
        examples: [
          '/api/weather?adm4=3509070001',
          '/api/weather?desa=ngringo',
          '/api/weather?q=jakarta'
        ]
      });
    }

    console.log(`🌤️ Fetching weather data for ADM4: ${targetAdm4}`);

    // Ambil data cuaca dari BMKG
    const weatherData = await getBMKGWeatherData(targetAdm4);

    if (!weatherData || !weatherData.data || weatherData.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data cuaca tidak ditemukan untuk lokasi ini',
        adm4: targetAdm4
      });
    }

    // Format response
    const responseData = {
      success: true,
      timestamp: new Date().toISOString(),
      source: 'BMKG API',
      adm4: targetAdm4,
      village_info: villageInfo,
      data: weatherData.data
    };

    console.log(`✅ Weather data retrieved successfully for ADM4: ${targetAdm4}`);
    
    res.status(200).json(responseData);

  } catch (error) {
    console.error('Weather endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data cuaca',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};
