const fs = require('fs').promises;
const path = require('path');

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
    const { limit = 100, offset = 0, provinsi, kabupaten } = req.query;
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    console.log(`📋 Getting villages list (limit: ${limitNum}, offset: ${offsetNum})`);

    // Load desa data
    const desaDataPath = path.join(process.cwd(), 'backend/data/desa.json');
    const desaDataRaw = await fs.readFile(desaDataPath, 'utf8');
    let villages = JSON.parse(desaDataRaw);

    // Filter by provinsi if provided
    if (provinsi) {
      villages = villages.filter(village => 
        village.provinsi.toLowerCase().includes(provinsi.toLowerCase())
      );
    }

    // Filter by kabupaten if provided
    if (kabupaten) {
      villages = villages.filter(village => 
        village.kabupaten.toLowerCase().includes(kabupaten.toLowerCase())
      );
    }

    // Pagination
    const total = villages.length;
    const paginatedVillages = villages
      .slice(offsetNum, offsetNum + limitNum)
      .map(village => ({
        kode_desa: village.kode_desa,
        nama_desa: village.nama_desa,
        kecamatan: village.kecamatan,
        kabupaten: village.kabupaten,
        provinsi: village.provinsi,
        display_name: `${village.nama_desa}, ${village.kecamatan}, ${village.kabupaten}`
      }));

    console.log(`✅ Retrieved ${paginatedVillages.length} villages (total: ${total})`);

    res.status(200).json({
      success: true,
      total: total,
      limit: limitNum,
      offset: offsetNum,
      has_more: (offsetNum + limitNum) < total,
      data: paginatedVillages,
      timestamp: new Date().toISOString(),
      filters: {
        provinsi: provinsi || null,
        kabupaten: kabupaten || null
      }
    });

  } catch (error) {
    console.error('Get desa error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data desa',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};
