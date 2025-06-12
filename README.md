# CuacaMap 🌤️

Aplikasi pemetaan cuaca Indonesia menggunakan data BMKG dengan visualisasi interaktif.

## ✨ Fitur

- 🗺️ **Peta Interaktif**: Menggunakan Leaflet untuk menampilkan peta Indonesia
- 🌡️ **Data Cuaca Real-time**: Integrasi dengan API BMKG untuk data cuaca terkini
- 📍 **Marker Cuaca**: Menampilkan informasi cuaca detail di lokasi tertentu
- 🎯 **Click Navigation**: Klik pada peta untuk melihat koordinat lokasi
- 📱 **Responsive UI**: Interface yang responsif dan user-friendly

## 🚀 Quick Start

### 1. Setup Backend
```bash
cd backend
npm install
node server.js
```
Server akan berjalan di: `http://localhost:5000`

### 2. Setup Frontend
```bash
cd frontend
npm install
npm start
```
Aplikasi akan terbuka di: `http://localhost:3000`

## 📁 Struktur Project

```
cuacamap/
├── backend/                 # Node.js + Express server
│   ├── controllers/         # Request handlers
│   ├── routes/             # API routes
│   ├── services/           # External API integrations
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Application pages
│   │   └── services/       # API communication
│   └── public/
└── CLEANUP_NOTES.md        # Development history
```

## 🔧 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Axios** - HTTP client untuk BMKG API
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend
- **React** - UI framework
- **Leaflet** - Interactive maps
- **React-Leaflet** - React wrapper untuk Leaflet
- **Axios** - HTTP client

## 🌐 API Endpoints

- `GET /api/weather?adm4={code}` - Ambil data cuaca berdasarkan kode adm4
- `GET /` - Health check endpoint

**Server Backend**: `http://localhost:5000`

## 📊 Cara Penggunaan

1. **Buka aplikasi** di browser (`http://localhost:3000`)
2. **Masukkan kode adm4** desa/kelurahan (contoh: `31.73.08.1001`)
3. **Klik "Ambil Data"** untuk menampilkan marker cuaca
4. **Klik marker** di peta untuk melihat detail cuaca
5. **Klik di peta** untuk melihat koordinat lokasi

## 🗺️ Contoh Kode ADM4

- **Jakarta Pusat (Gambir)**: `31.71.01.1001`
- **Jakarta Barat (Kembangan Utara)**: `31.73.08.1001`  
- **Bandung (Hegarmanah)**: `32.73.08.1001`

**Multi-location**: `31.73.08.1001,31.71.01.1001,32.73.08.1001`

📋 Lihat daftar lengkap di: [ADM4_CODES.md](./ADM4_CODES.md)

## 🛠️ Development Notes

Project ini telah dibersihkan dari:
- ❌ GeoJSON processing (terlalu berat untuk 700MB files)
- ❌ Turf.js spatial operations
- ❌ Point-in-polygon detection
- ❌ PostGIS database integration

Fokus pada:
- ✅ Simple weather marker display
- ✅ BMKG API integration
- ✅ Clean and maintainable code
- ✅ Performance optimization

## 🤝 Contributing

1. Fork the project
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [BMKG](https://bmkg.go.id) untuk data cuaca Indonesia
- [OpenStreetMap](https://openstreetmap.org) untuk tiles peta
- [Leaflet](https://leafletjs.com) untuk library peta interaktif
