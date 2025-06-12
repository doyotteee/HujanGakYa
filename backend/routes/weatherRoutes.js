const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

/**
 * Weather routes
 * Base path: /api/weather
 */

// GET /api/weather - Mendapatkan data cuaca berdasarkan kode ADM4 atau nama desa
router.get('/', weatherController.getWeatherByAdm4);

// GET /api/weather/search - Mendapatkan data cuaca berdasarkan nama desa  
router.get('/search', weatherController.getWeatherByDesaName);

// GET /api/weather/hourly - Mendapatkan data cuaca per 3 jam
router.get('/hourly', weatherController.getHourlyWeather);

// GET /api/weather/test - Test koneksi ke API BMKG
router.get('/test', weatherController.testConnection);

// GET /api/weather/info - Informasi tentang weather API
router.get('/info', (req, res) => {
  res.json({
    service: "CuacaMap Weather API",
    version: "2.0.0", 
    description: "API untuk data cuaca desa Indonesia dari BMKG",
    endpoints: {
      weather: {
        path: "/api/weather",
        method: "GET",
        parameters: {
          adm4: "String - Kode ADM4 (33.13.11.2005)",
          desa: "String - Nama desa untuk pencarian",
          q: "String - Query pencarian alternatif"
        }
      },
      search: {
        path: "/api/weather/search",
        method: "GET", 
        parameters: {
          desa: "String (required) - Nama desa",
          q: "String - Query pencarian alternatif"
        }
      },
      hourly: {
        path: "/api/weather/hourly",
        method: "GET",
        parameters: {
          desa: "String (required) - Nama desa", 
          adm4: "String - Kode ADM4 langsung"
        },
        description: "Data cuaca per 3 jam untuk analisis detail"
      },
      test: {
        path: "/api/weather/test",
        method: "GET",
        description: "Test koneksi ke API BMKG"
      }
    },
    features: [
      "Data cuaca real-time dari BMKG",
      "Prakiraan cuaca per 3 jam (19 slot total)",
      "Data cuaca 3 hari ke depan",
      "Pencarian berdasarkan nama desa", 
      "Koordinat geografis untuk mapping",
      "Data lengkap: suhu, kelembapan, angin, curah hujan"
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
