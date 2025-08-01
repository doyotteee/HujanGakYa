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
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Parameter q (query) minimal 2 karakter',
        example: '/api/search-desa?q=jakarta'
      });
    }

    console.log(`🔍 Searching villages for: "${q}"`);

    // Load desa data
    const desaDataPath = path.join(process.cwd(), 'backend/data/desa.json');
    const desaDataRaw = await fs.readFile(desaDataPath, 'utf8');
    const villages = JSON.parse(desaDataRaw);

    const searchTerm = q.toLowerCase().trim();
    const limitNum = parseInt(limit);

    // Search villages
    const matchedVillages = villages
      .filter(village => {
        return (
          village.nama_desa.toLowerCase().includes(searchTerm) ||
          village.kecamatan.toLowerCase().includes(searchTerm) ||
          village.kabupaten.toLowerCase().includes(searchTerm) ||
          village.provinsi.toLowerCase().includes(searchTerm)
        );
      })
      .slice(0, limitNum)
      .map(village => ({
        kode_desa: village.kode_desa,
        nama_desa: village.nama_desa,
        kecamatan: village.kecamatan,
        kabupaten: village.kabupaten,
        provinsi: village.provinsi,
        display_name: `${village.nama_desa}, ${village.kecamatan}, ${village.kabupaten}`,
        full_name: `${village.nama_desa}, Kec. ${village.kecamatan}, Kab. ${village.kabupaten}, ${village.provinsi}`
      }));

    console.log(`✅ Found ${matchedVillages.length} villages matching "${q}"`);

    res.status(200).json({
      success: true,
      query: q,
      total_found: matchedVillages.length,
      limit: limitNum,
      data: matchedVillages,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search desa error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mencari data desa',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};
