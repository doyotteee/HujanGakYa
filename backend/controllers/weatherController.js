const bmkgService = require('../services/bmkgService');
const fs = require('fs').promises;
const path = require('path');

/**
 * Controller untuk menangani request cuaca
 */
class WeatherController {
  /**
   * Mendapatkan data cuaca berdasarkan kode ADM4
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */  async getWeatherByAdm4(req, res) {
    try {
      const { adm4, desa, q } = req.query;
      
      let targetAdm4 = adm4;
      let villageInfo = null;

      // Jika ada parameter desa atau q, cari kode ADM4 berdasarkan nama desa
      if (!adm4 && (desa || q)) {
        const query = desa || q;
        console.log(`🔍 Searching ADM4 for desa: "${query}"`);
        
        try {
          // Load desa data langsung dari file JSON
          const desaDataPath = path.join(__dirname, '../data/desa.json');
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
          const firstVillage = matchedVillages[0];
          targetAdm4 = firstVillage.adm4_code;
          villageInfo = {
            nama_desa: firstVillage.nama_desa,
            kecamatan: firstVillage.kecamatan,
            kabupaten: firstVillage.kabupaten,
            provinsi: firstVillage.provinsi,
            adm4_code: firstVillage.adm4_code,
            totalFound: matchedVillages.length
          };
          
          console.log(`✅ Found village: ${firstVillage.nama_desa}, ADM4: ${firstVillage.adm4_code}`);
          
        } catch (searchError) {
          console.error('❌ Error searching village:', searchError);
          return res.status(500).json({
            success: false,
            message: 'Error saat mencari data desa',
            error: searchError.message
          });
        }
      }

      // Validasi parameter
      if (!targetAdm4) {
        return res.status(400).json({
          success: false,
          error: 'Parameter diperlukan',
          message: 'Silakan masukkan kode wilayah ADM4 atau nama desa',
          examples: [
            '/api/weather?adm4=31.71.01.1001',
            '/api/weather?desa=ngringo',
            '/api/weather?q=jakarta'
          ]
        });
      }

      // Validasi format kode ADM4 (basic validation)
      if (!/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/.test(targetAdm4)) {
        return res.status(400).json({
          success: false,
          error: 'Format kode ADM4 tidak valid',
          message: 'Format kode ADM4 harus: XX.XX.XX.XXXX',
          example: '31.71.01.1001'
        });
      }

      console.log(`🌤️  Processing weather request for ADM4: ${targetAdm4}`);

      // Ambil data cuaca dari service
      const weatherData = await bmkgService.getWeatherByAdm4(targetAdm4);

      // Response sukses
      const response = {
        success: true,
        data: weatherData,
        timestamp: new Date().toISOString()
      };

      // Tambahkan info pencarian jika ada
      if (villageInfo) {
        response.searchInfo = villageInfo;
        response.message = villageInfo.totalFound > 1 
          ? `Ditemukan ${villageInfo.totalFound} desa, menampilkan cuaca untuk: ${villageInfo.nama_desa}`
          : `Data cuaca untuk ${villageInfo.nama_desa}`;
      } else {
        response.message = `Data cuaca berhasil diambil untuk ADM4: ${targetAdm4}`;
      }

      res.json(response);

    } catch (error) {
      console.error('❌ Weather Controller Error:', error.message);

      // Handle berbagai jenis error
      if (error.message.includes('Timeout')) {
        return res.status(504).json({
          error: 'Gateway Timeout',
          message: 'API BMKG tidak merespons dalam waktu yang ditentukan',
          suggestion: 'Silakan coba beberapa saat lagi'
        });
      }

      if (error.message.includes('tidak dapat terhubung')) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Tidak dapat terhubung ke server BMKG',
          suggestion: 'Periksa koneksi internet atau coba lagi nanti'
        });
      }

      if (error.message.includes('API BMKG error')) {
        return res.status(502).json({
          error: 'Bad Gateway',
          message: error.message,
          suggestion: 'Server BMKG mengalami masalah'
        });
      }

      // Generic error
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
        suggestion: 'Silakan hubungi administrator jika masalah berlanjut'
      });
    }
  }

  /**
   * Mendapatkan data cuaca berdasarkan nama desa
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getWeatherByDesaName(req, res) {
    try {
      const { desa, q } = req.query;
      const query = desa || q;

      // Validasi parameter
      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Parameter nama desa diperlukan',
          message: 'Silakan masukkan nama desa (minimal 2 karakter)',
          examples: [
            '/api/weather/search?desa=ngringo',
            '/api/weather/search?q=jakarta'
          ]
        });
      }      console.log(`🔍 Searching weather for desa: "${query}"`);

      // 1. Load desa data langsung dari file JSON
      const desaDataPath = path.join(__dirname, '../data/desa.json');
      const desaDataRaw = await fs.readFile(desaDataPath, 'utf8');
      const villages = JSON.parse(desaDataRaw);
      
      // 2. Cari desa berdasarkan nama
      const matchedVillages = villages.filter(village => {
        const searchText = query.toLowerCase();
        return (
          village.nama_desa.toLowerCase().includes(searchText) ||
          village.kecamatan.toLowerCase().includes(searchText) ||
          village.kabupaten.toLowerCase().includes(searchText)
        );
      });      if (matchedVillages.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Tidak ditemukan desa dengan nama "${query}"`,
          suggestion: 'Coba gunakan nama yang lebih spesifik atau periksa ejaan'
        });
      }

      // 3. Ambil desa pertama dan dapatkan cuacanya
      const firstVillage = matchedVillages[0];
      console.log(`✅ Found village: ${firstVillage.nama_desa}, ADM4: ${firstVillage.adm4_code}`);

      // 4. Ambil data cuaca menggunakan kode ADM4
      const weatherData = await bmkgService.getWeatherByAdm4(firstVillage.adm4_code);

      // 5. Response dengan informasi desa yang ditemukan
      res.json({
        success: true,
        query: query,
        selectedVillage: {
          nama_desa: firstVillage.nama_desa,
          kecamatan: firstVillage.kecamatan,
          kabupaten: firstVillage.kabupaten,
          provinsi: firstVillage.provinsi,
          adm4_code: firstVillage.adm4_code
        },        totalFound: matchedVillages.length,
        weather: weatherData,
        message: matchedVillages.length > 1 
          ? `Ditemukan ${matchedVillages.length} desa, menampilkan cuaca untuk: ${firstVillage.nama_desa}`
          : `Cuaca untuk ${firstVillage.nama_desa}`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Weather by Desa Name Error:', error.message);

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Test koneksi ke API BMKG
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testConnection(req, res) {
    try {
      console.log('🧪 Testing BMKG API connection...');
      
      // Test basic connectivity
      const isConnected = await bmkgService.testConnection();
      
      if (!isConnected) {
        return res.status(503).json({
          success: false,
          status: 'disconnected',
          message: 'Tidak dapat terhubung ke API BMKG',
          timestamp: new Date().toISOString()
        });
      }

      // Test dengan sample ADM4 (Jakarta Pusat)
      const sampleAdm4 = '31.71.01.1001';
      console.log(`🧪 Testing with sample ADM4: ${sampleAdm4}`);
      
      const testData = await bmkgService.getWeatherByAdm4(sampleAdm4);
      
      // Extract basic info dari test data
      const testInfo = {
        location_found: testData.lokasi ? true : false,
        forecast_days: testData.forecast ? testData.forecast.length : 0,
        total_forecasts: 0,
        current_weather_available: testData.currentWeather ? true : false
      };

      // Hitung total forecast items
      if (testData.forecast) {
        testData.forecast.forEach(day => {
          if (day.forecasts) {
            testInfo.total_forecasts += day.forecasts.length;
          }
        });
      }

      res.json({
        success: true,
        status: 'connected',
        message: 'Koneksi ke API BMKG berhasil',
        bmkg_api: {
          base_url: bmkgService.baseURL,
          timeout: bmkgService.timeout,
          response_time: 'OK'
        },
        test_result: {
          sample_adm4: sampleAdm4,
          sample_location: testData.lokasi?.desa || 'N/A',
          ...testInfo
        },
        available_endpoints: {
          weather: '/api/weather?adm4=XX.XX.XX.XXXX',
          search: '/api/weather/search?desa=nama_desa',
          hourly: '/api/weather/hourly?desa=nama_desa',
          test: '/api/weather/test'
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Test Connection Error:', error.message);
      
      res.status(500).json({
        success: false,
        status: 'error',
        message: 'Error saat testing koneksi BMKG',
        error: error.message,
        suggestion: 'Periksa koneksi internet atau coba lagi nanti',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Mendapatkan informasi API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getInfo(req, res) {
    res.json({
      service: 'CuacaMap Weather API',
      version: '2.0.0',
      description: 'API untuk mengambil data cuaca dari BMKG berdasarkan kode wilayah ADM4',
      endpoints: {
        weather: {
          path: '/api/weather',
          method: 'GET',
          parameters: {
            adm4: {
              required: true,
              type: 'string',
              format: 'XX.XX.XX.XXXX',
              description: 'Kode wilayah tingkat 4 (desa/kelurahan)'
            }
          },
          example: '/api/weather?adm4=31.71.01.1001'
        },
        test: {
          path: '/api/weather/test',
          method: 'GET',
          description: 'Test koneksi ke API BMKG'
        }
      },
      features: [
        'Data cuaca real-time dari BMKG',
        'Prakiraan cuaca multi-hari',
        'Informasi detail: suhu, kelembapan, angin, curah hujan',
        'Data koordinat dan zona waktu',
        'Error handling yang komprehensif'
      ],
      dataSource: 'BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Mendapatkan data cuaca per jam (3 jam interval) dalam format optimal
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getHourlyWeather(req, res) {
    try {
      const { desa, q, adm4 } = req.query;
      
      let targetAdm4 = adm4;
      let villageInfo = null;

      // Jika tidak ada ADM4, cari berdasarkan nama desa
      if (!adm4 && (desa || q)) {
        const query = desa || q;
        console.log(`🔍 Searching ADM4 for hourly weather: "${query}"`);
        
        try {
          const desaDataPath = path.join(__dirname, '../data/desa.json');
          const desaDataRaw = await fs.readFile(desaDataPath, 'utf8');
          const villages = JSON.parse(desaDataRaw);
          
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
              suggestion: 'Coba gunakan nama yang lebih spesifik atau periksa ejaan'
            });
          }

          const firstVillage = matchedVillages[0];
          targetAdm4 = firstVillage.adm4_code;
          villageInfo = {
            nama_desa: firstVillage.nama_desa,
            kecamatan: firstVillage.kecamatan,
            kabupaten: firstVillage.kabupaten,
            provinsi: firstVillage.provinsi,
            adm4_code: firstVillage.adm4_code
          };
          
        } catch (searchError) {
          console.error('❌ Error searching village for hourly:', searchError);
          return res.status(500).json({
            success: false,
            message: 'Error saat mencari data desa',
            error: searchError.message
          });
        }
      }

      // Validasi parameter
      if (!targetAdm4) {
        return res.status(400).json({
          success: false,
          error: 'Parameter diperlukan',
          message: 'Silakan masukkan kode wilayah ADM4 atau nama desa',
          examples: [
            '/api/weather/hourly?adm4=31.71.01.1001',
            '/api/weather/hourly?desa=ngringo',
            '/api/weather/hourly?q=jakarta'
          ]
        });
      }

      console.log(`📊 Processing hourly weather request for ADM4: ${targetAdm4}`);

      // Ambil data cuaca lengkap dari service
      const weatherData = await bmkgService.getWeatherByAdm4(targetAdm4);

      // Extract semua data per 3 jam
      const allHourlyData = [];
      
      if (weatherData.forecast && weatherData.forecast.length > 0) {
        weatherData.forecast.forEach(day => {
          if (day.forecasts && day.forecasts.length > 0) {
            day.forecasts.forEach(forecast => {
              allHourlyData.push({
                day: day.day,
                date: day.date,
                datetime: forecast.datetime,
                local_datetime: forecast.local_datetime,
                utc_datetime: forecast.utc_datetime,
                temperature: {
                  celsius: forecast.temperature.celsius,
                  fahrenheit: forecast.temperature.fahrenheit
                },
                weather: {
                  code: forecast.weather.code,
                  description: forecast.weather.description,
                  description_en: forecast.weather.description_en,
                  icon_url: forecast.weather.image
                },
                wind: {
                  speed: forecast.wind.speed,
                  direction: forecast.wind.direction,
                  direction_deg: forecast.wind.direction_deg,
                  direction_to: forecast.wind.direction_to
                },
                humidity: forecast.humidity,
                cloud_cover: forecast.cloud_cover,
                precipitation: forecast.precipitation,
                visibility: {
                  value: forecast.visibility.value,
                  text: forecast.visibility.text
                },
                time_index: forecast.time_index,
                analysis_date: forecast.analysis_date
              });
            });
          }
        });
      }

      // Response optimized untuk hourly data
      const response = {
        success: true,
        location: {
          adm4: targetAdm4,
          desa: weatherData.lokasi?.desa || (villageInfo?.nama_desa || 'N/A'),
          kecamatan: weatherData.lokasi?.kecamatan || (villageInfo?.kecamatan || 'N/A'),
          kabupaten: weatherData.lokasi?.kotkab || (villageInfo?.kabupaten || 'N/A'),
          provinsi: weatherData.lokasi?.provinsi || (villageInfo?.provinsi || 'N/A'),
          coordinates: {
            lat: weatherData.lokasi?.lat || null,
            lon: weatherData.lokasi?.lon || null
          },
          timezone: weatherData.lokasi?.timezone || 'Asia/Jakarta'
        },
        data_summary: {
          total_forecasts: allHourlyData.length,
          forecast_days: weatherData.forecast?.length || 0,
          interval: '3 hours',
          coverage: `${allHourlyData.length * 3} hours total`,
          first_forecast: allHourlyData.length > 0 ? allHourlyData[0].local_datetime : null,
          last_forecast: allHourlyData.length > 0 ? allHourlyData[allHourlyData.length - 1].local_datetime : null
        },
        hourly_forecast: allHourlyData,
        current_weather: weatherData.currentWeather || (allHourlyData.length > 0 ? allHourlyData[0] : null),
        timestamp: new Date().toISOString()
      };

      // Tambahkan info pencarian jika ada
      if (villageInfo) {
        response.search_info = villageInfo;
        response.message = `Data cuaca per 3 jam untuk ${villageInfo.nama_desa}`;
      } else {
        response.message = `Data cuaca per 3 jam untuk ADM4: ${targetAdm4}`;
      }

      res.json(response);

    } catch (error) {
      console.error('❌ Hourly Weather Error:', error.message);

      // Handle berbagai jenis error
      if (error.message.includes('Timeout')) {
        return res.status(504).json({
          success: false,
          error: 'Gateway Timeout',
          message: 'API BMKG tidak merespons dalam waktu yang ditentukan',
          suggestion: 'Silakan coba beberapa saat lagi'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message,
        suggestion: 'Silakan hubungi administrator jika masalah berlanjut'
      });
    }
  }
}

module.exports = new WeatherController();