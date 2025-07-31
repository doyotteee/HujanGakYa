const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Environment check
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';

console.log(`🚀 Starting CuacaMap Backend Server in ${NODE_ENV} mode...`);

// CORS configuration untuk production
const corsOptions = {
  origin: isDevelopment ? '*' : [
    'https://hujangakya.vercel.app',
    'https://*.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CuacaMap Backend API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// Import controllers dengan error handling
let desaController, weatherController;
try {
  desaController = require('./controllers/desaController');
  weatherController = require('./controllers/weatherController');
  console.log('✅ Controllers loaded successfully');
} catch (error) {
  console.error('❌ Error loading controllers:', error.message);
}

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    service: "CuacaMap Desa API",
    version: "2.0.0",
    description: "API untuk pencarian data desa/kelurahan Indonesia",
    statistics: desaController ? desaController.getStatistics() : {},
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

// Weather routes dengan error handling
if (weatherController) {
  app.get('/api/weather', (req, res, next) => {
    try {
      weatherController.getWeatherByAdm4.bind(weatherController)(req, res, next);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/weather/search', (req, res, next) => {
    try {
      weatherController.getWeatherByDesaName.bind(weatherController)(req, res, next);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/weather/hourly', (req, res, next) => {
    try {
      weatherController.getHourlyWeather.bind(weatherController)(req, res, next);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/weather/test', (req, res, next) => {
    try {
      weatherController.testConnection.bind(weatherController)(req, res, next);
    } catch (error) {
      next(error);
    }
  });
}
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

// Desa routes dengan error handling
if (desaController) {
  app.get('/api/desa', (req, res, next) => {
    try {
      desaController.getAllDesa.bind(desaController)(req, res, next);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/search-desa', (req, res, next) => {
    try {
      desaController.searchDesa.bind(desaController)(req, res, next);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/desa/provinsi/:provinsi', (req, res, next) => {
    try {
      desaController.getDesaByProvinsi.bind(desaController)(req, res, next);
    } catch (error) {
      next(error);
    }
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Jangan gunakan app.listen() di Vercel (hanya untuk development)
if (isDevelopment) {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 API available at: http://localhost:${PORT}/api`);
    console.log(`🌐 CORS enabled for development`);
  });
}

// Export for Vercel
module.exports = app;
