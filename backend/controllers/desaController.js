const fs = require('fs').promises;
const path = require('path');
const bmkgService = require('../services/bmkgService');

/**
 * Controller untuk menangani request data desa/wilayah
 */
class DesaController {
  constructor() {
    // Use simplified data file
    this.desaDataPath = path.join(__dirname, '../data/desa.json');
    this.desaData = null;
    this.dataLoaded = false;
    this.loadPromise = null;
    this.loadDesaData();
  }

  /**
   * Load data desa dari file JSON dengan fallback mechanism
   */
  async loadDesaData() {
    if (this.dataLoaded) return this.desaData;
    if (this.loadPromise) return this.loadPromise;    this.loadPromise = new Promise(async (resolve, reject) => {
      try {
        console.log('🔄 Loading village data...');
        const data = await fs.readFile(this.desaDataPath, 'utf8');
        this.desaData = JSON.parse(data);
        this.dataLoaded = true;        console.log(`✅ Loaded ${this.desaData.length} villages from database`);
        resolve(this.desaData);
      } catch (error) {
        console.error('❌ Error loading village data:', error.message);
        this.desaData = [];
        this.dataLoaded = true;
        reject(error);
      }
    });

    return this.loadPromise;
  }

  /**
   * Mendapatkan semua data desa
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllDesa(req, res) {
    try {
      await this.loadDesaData();
      const { limit = 100, offset = 0 } = req.query;
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);

      if (this.desaData.length === 0) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Data desa tidak tersedia',
          suggestion: 'Silakan hubungi administrator'
        });
      }

      const total = this.desaData.length;
      const data = this.desaData.slice(offsetNum, offsetNum + limitNum);

      res.json({
        success: true,
        data: data,
        pagination: {
          total: total,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < total
        },
        message: `${data.length} desa dari total ${total} desa`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Get All Desa Error:', error.message);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  /**
   * Mencari desa berdasarkan query
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchDesa(req, res) {
    try {
      await this.loadDesaData();
      const { q, limit = 20 } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          error: 'Parameter pencarian diperlukan',
          message: 'Silakan masukkan kata kunci pencarian',
          example: '/api/search-desa?q=jakarta'
        });
      }

      if (this.desaData.length === 0) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Data desa tidak tersedia',
          suggestion: 'Silakan hubungi administrator'
        });
      }

      const query = q.trim().toLowerCase();
      const limitNum = parseInt(limit);

      console.log(`🔍 Searching desa with query: "${query}"`);

      // Pencarian dengan multiple criteria - updated for new data structure
      const results = this.desaData.filter(desa => {
        return (
          desa.nama_desa.toLowerCase().includes(query) ||
          desa.kecamatan.toLowerCase().includes(query) ||
          desa.kabupaten.toLowerCase().includes(query) ||
          desa.provinsi.toLowerCase().includes(query) ||
          desa.adm4_code.includes(query)
        );
      });

      // Sort by relevance (exact matches first)
      const sortedResults = results.sort((a, b) => {
        const aExact = a.nama_desa.toLowerCase() === query;
        const bExact = b.nama_desa.toLowerCase() === query;
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        return a.nama_desa.localeCompare(b.nama_desa);
      });

      const limitedResults = sortedResults.slice(0, limitNum);

      res.json({
        success: true,
        data: limitedResults,
        query: q,
        totalFound: sortedResults.length,
        totalShown: limitedResults.length,
        message: `Ditemukan ${sortedResults.length} hasil untuk "${q}"`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Search Desa Error:', error.message);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  /**
   * Mendapatkan desa berdasarkan provinsi
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDesaByProvinsi(req, res) {
    try {
      await this.loadDesaData();
      const { provinsi } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      if (!provinsi) {
        return res.status(400).json({
          error: 'Parameter provinsi diperlukan',
          message: 'Silakan masukkan nama provinsi',
          example: '/api/desa/provinsi/Jakarta'
        });
      }

      if (this.desaData.length === 0) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Data desa tidak tersedia'
        });
      }

      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      const provinsiQuery = provinsi.toLowerCase();

      console.log(`🔍 Getting desa for provinsi: "${provinsi}"`);

      const filteredData = this.desaData.filter(desa => 
        desa.provinsi.toLowerCase().includes(provinsiQuery)
      );

      const total = filteredData.length;
      const data = filteredData.slice(offsetNum, offsetNum + limitNum);

      if (total === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Tidak ditemukan desa untuk provinsi "${provinsi}"`,
          suggestion: 'Periksa ejaan nama provinsi'
        });
      }

      res.json({
        success: true,
        data: data,
        provinsi: provinsi,
        pagination: {
          total: total,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < total
        },
        message: `${data.length} desa dari ${total} total desa di ${provinsi}`,
        timestamp: new Date().toISOString()
      });    } catch (error) {
      console.error('❌ Get Desa by Provinsi Error:', error.message);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  /**
   * Search desa dan langsung ambil data cuaca
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchDesaWithWeather(req, res) {
    try {
      await this.loadDesaData();
      const { q, limit = 5 } = req.query;

      // Validasi input
      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Query minimal 2 karakter',
          example: '/api/search-with-weather?q=ngringo'
        });
      }

      const query = q.trim().toLowerCase();
      const limitNum = parseInt(limit);
      console.log(`🔍 Searching desa with weather for: "${query}"`);

      // 1. Search desa terlebih dahulu
      const villages = this.desaData.filter(desa => {
        return (
          desa.nama_desa.toLowerCase().includes(query) ||
          desa.kecamatan.toLowerCase().includes(query) ||
          desa.kabupaten.toLowerCase().includes(query) ||
          desa.provinsi.toLowerCase().includes(query) ||
          desa.adm4_code.includes(query)
        );
      });

      if (villages.length === 0) {
        return res.json({
          success: false,
          message: 'Tidak ada desa ditemukan',
          query: q,
          suggestions: [
            'Coba kata kunci yang lebih umum',
            'Periksa ejaan nama desa',
            'Gunakan nama kecamatan atau kabupaten'
          ],
          results: []
        });
      }

      console.log(`📍 Found ${villages.length} villages, processing ${Math.min(limitNum, villages.length)} with weather`);

      // 2. Ambil cuaca untuk setiap desa (batasi untuk performa)
      const villagesToProcess = villages.slice(0, limitNum);
      const results = [];

      for (const village of villagesToProcess) {
        try {
          console.log(`🌤️  Getting weather for ${village.nama_desa} (${village.adm4_code})`);
          
          // Ambil data cuaca
          const weatherData = await bmkgService.getWeatherByAdm4(village.adm4_code);
          
          results.push({
            village: {
              adm4_code: village.adm4_code,
              nama_desa: village.nama_desa,
              kecamatan: village.kecamatan,
              kabupaten: village.kabupaten,
              provinsi: village.provinsi
            },
            weather: weatherData,
            status: 'success'
          });

          console.log(`✅ Weather data retrieved for ${village.nama_desa}`);
        } catch (weatherError) {
          console.error(`❌ Weather failed for ${village.nama_desa}:`, weatherError.message);
          
          // Jika cuaca gagal, tetap masukkan data desa
          results.push({
            village: {
              adm4_code: village.adm4_code,
              nama_desa: village.nama_desa,
              kecamatan: village.kecamatan,
              kabupaten: village.kabupaten,
              provinsi: village.provinsi
            },
            weather: null,
            status: 'weather_failed',
            error: weatherError.message
          });
        }
      }

      console.log(`🎯 Returning ${results.length} results with weather data`);

      res.json({
        success: true,
        query: q,
        totalFound: villages.length,
        totalShown: results.length,
        message: results.length > 0 ? 'Data desa dan cuaca berhasil diambil' : 'Data desa ditemukan tapi cuaca gagal',
        results: results,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error search with weather:', error);
      res.status(500).json({
        success: false,
        message: 'Server error saat mengambil data desa dan cuaca',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Mendapatkan informasi tentang data desa
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getInfo(req, res) {
    try {
      await this.loadDesaData();
      // Hitung statistik
      const stats = {
        totalDesa: this.desaData.length,
        totalProvinsi: 0,
        totalKotkab: 0,
        totalKecamatan: 0
      };

      if (this.desaData.length > 0) {
        const provinsiSet = new Set();
        const kotkabSet = new Set();
        const kecamatanSet = new Set();

        this.desaData.forEach(desa => {
          provinsiSet.add(desa.provinsi);
          kotkabSet.add(desa.kabupaten);
          kecamatanSet.add(desa.kecamatan);
        });

        stats.totalProvinsi = provinsiSet.size;
        stats.totalKotkab = kotkabSet.size;
        stats.totalKecamatan = kecamatanSet.size;
      }

      res.json({
        service: 'CuacaMap Desa API',
        version: '2.0.0',
        description: 'API untuk pencarian data desa/kelurahan Indonesia',
        statistics: stats,
        endpoints: {
          all: {
            path: '/api/desa',
            method: 'GET',
            parameters: {
              limit: 'Number (default: 100)',
              offset: 'Number (default: 0)'
            }
          },
          search: {
            path: '/api/search-desa',
            method: 'GET',
            parameters: {
              q: 'String (required) - kata kunci pencarian',
              limit: 'Number (default: 20)'
            }
          },
          byProvinsi: {
            path: '/api/desa/provinsi/:provinsi',
            method: 'GET',
            parameters: {
              limit: 'Number (default: 50)',
              offset: 'Number (default: 0)'
            }
          }
        },
        features: [
          'Pencarian desa berdasarkan nama',
          'Pencarian berdasarkan kecamatan, kabupaten, provinsi',
          'Pencarian berdasarkan kode ADM4',
          'Filtering berdasarkan provinsi',
          'Pagination untuk hasil yang banyak',
          'Data lengkap: koordinat, kode wilayah, hierarki administratif'
        ],
        dataSource: 'Kemendagri - Kode dan Data Wilayah Administrasi Pemerintahan',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Get Desa Info Error:', error.message);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
}

module.exports = new DesaController();
