const express = require('express');
const cors = require('cors');
 require('dotenv').config();

console.log('🚀 Starting CuacaMap Backend Server...');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import controllers
const desaController = require('./controllers/desaController');
const weatherController = require('./controllers/weatherController');

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    service: "CuacaMap Desa API",
    version: "2.0.0",
    description: "API untuk pencarian data desa/kelurahan Indonesia",
    statistics: desaController.getStatistics(),
    endpoints: {
      all: {
        path: "/api/desa",
        method: "GET", 
        parameters: {
          limit: "Number (default: 100)",
          offset: "Number (default: 0)"
        }
      },
      search: {
        path: "/api/search-desa",
        method: "GET",
        parameters: {
          q: "String (required) - kata kunci pencarian",
          limit: "Number (default: 20)"
        }
      },
      byProvinsi: {
        path: "/api/desa/provinsi/:provinsi",
        method: "GET",
        parameters: {
          limit: "Number (default: 50)",
          offset: "Number (default: 0)"
        }
      }
    },
    features: [
      "Pencarian desa berdasarkan nama",
      "Pencarian berdasarkan kecamatan, kabupaten, provinsi", 
      "Pencarian berdasarkan kode ADM4",
      "Filtering berdasarkan provinsi",
      "Pagination untuk hasil yang banyak",
      "Data lengkap: koordinat, kode wilayah, hierarki administratif"
    ],
    dataSource: "Kemendagri - Kode dan Data Wilayah Administrasi Pemerintahan",
    timestamp: new Date().toISOString()
  });
});

// Weather routes - manual setup
app.get('/api/weather', weatherController.getWeatherByAdm4.bind(weatherController));
app.get('/api/weather/search', weatherController.getWeatherByDesaName.bind(weatherController));
app.get('/api/weather/hourly', weatherController.getHourlyWeather.bind(weatherController));
app.get('/api/weather/test', weatherController.testConnection.bind(weatherController));
app.get('/api/weather/info', (req, res) => {
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
        }
      },
      test: {
        path: "/api/weather/test",
        method: "GET",
        description: "Test koneksi ke API BMKG"
      }
    },
    features: [
      "Data cuaca real-time dari BMKG",
      "Prakiraan cuaca per 3 jam",
      "Data cuaca 3 hari ke depan", 
      "Pencarian berdasarkan nama desa",
      "Koordinat geografis untuk mapping",
      "Data lengkap: suhu, kelembapan, angin, curah hujan"
    ],
    timestamp: new Date().toISOString()
  });
});

// Desa routes - manual setup  
app.get('/api/desa', desaController.getAllDesa.bind(desaController));
app.get('/api/search-desa', desaController.searchDesa.bind(desaController));
app.get('/api/desa/provinsi/:provinsi', desaController.getDesaByProvinsi.bind(desaController));

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 API available at: http://localhost:${PORT}/api`);
  console.log(`🌐 CORS enabled for all origins`);
});

// Export for Vercel
module.exports = app;
