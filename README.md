# HujanGakYa 🌦️

Aplikasi cuaca Indonesia yang menyediakan informasi cuaca real-time, peringatan cuaca, dan peta interaktif. Dirancang khusus untuk membantu masyarakat Indone### Testing & Linting
```bash
# Frontend Testing
cd frontend
npm test

# Linting Check
npm run lint

# Auto-fix Linting Issues
npm run lint:fix

# Build Production
npm run build
```

### Debugging
- **React DevTools**: Untuk debugging komponen React
- **Network Tab**: Monitor API calls dan response
- **Console Logs**: Error handling dan debugging info
- **Responsive Design Mode**: Test di berbagai ukuran layar

## 🔗 API Documentation

### Endpoint Utama

#### Weather Data
```
GET /api/weather?adm4=<code>
```
**Deskripsi**: Mendapatkan data cuaca berdasarkan kode ADM4  
**Parameter**: 
- `adm4` - Kode administratif level 4 (desa)  
**Response**: Data cuaca lengkap dari BMKG

#### Search Villages
```
GET /api/weather/search?desa=<name>
```
**Deskripsi**: Mencari data cuaca berdasarkan nama desa  
**Parameter**: 
- `desa` - Nama desa/kota (partial match)  
**Response**: Array hasil pencarian dengan data cuaca

#### Location Search
```
GET /api/search-desa?q=<query>
```
**Deskripsi**: Mencari desa/kota untuk autocomplete  
**Parameter**: 
- `q` - Query pencarian  
**Response**: Array nama lokasi yang cocok

#### All Villages
```
GET /api/desa
```
**Deskripsi**: Mendapatkan semua data desa  
**Response**: Complete dataset desa di Indonesia

#### Health Check
```
GET /api/health
```
**Deskripsi**: Mengecek status server  
**Response**: Status server dan timestamp

### BMKG API Integration
**Data Structure BMKG**:
```json
{
  "data": [
    {
      "adm1": "Province",
      "adm2": "Regency", 
      "adm3": "District",
      "adm4": "Village",
      "coordinate": "lat,lon",
      "cuaca": [
        {
          "datetime": "202412140800",
          "t": "28",           // Temperature in Celsius
          "weather_desc": "Cerah Berawan",
          "wd_deg": "45",      // Wind direction in degrees  
          "ws": "15",          // Wind speed in km/h
          "hu": "75"           // Humidity percentage
        }
      ]
    }
  ]
}
```

## 🌐 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Serve static files
npx serve -s build -l 3000
```

### Environment Variables
```bash
# Backend (.env file)
PORT=5000
BMKG_API_URL=https://api.bmkg.go.id
NODE_ENV=production

# Frontend (.env file)  
REACT_APP_API_URL=http://localhost:5000
REACT_APP_MAP_CENTER_LAT=-6.2
REACT_APP_MAP_CENTER_LNG=106.816667
```

### Hosting Options
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Backend**: Heroku, Railway, DigitalOcean
- **Full-Stack**: Railway, Render, AWS Amplifyformasi cuaca terkini dengan antarmuka yang mudah digunakan.

## 🌟 Fitur Utama

### 🌤️ **Tab Cuaca**
- **Data Cuaca Real-time** dari BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
- **Informasi Lengkap**: Suhu, kondisi cuaca, kecepatan angin, dan kelembaban
- **Visualisasi Kelembaban**: Progress bar interaktif untuk tingkat kelembaban
- **Pencarian Lokasi**: Cari cuaca berdasarkan desa/kota di seluruh Indonesia
- **Auto-refresh**: Data cuaca diperbarui secara otomatis

### ⚠️ **Tab Peringatan**
- **Alert Otomatis**: Sistem peringatan cerdas untuk kondisi cuaca ekstrem
- **Kriteria Peringatan**:
  - 🌡️ Suhu > 35°C (Cuaca Sangat Panas)
  - 🌧️ Cuaca "hujan lebat" atau "badai"
  - 💨 Kecepatan angin > 25 km/jam (Angin Kencang)
- **Notifikasi Real-time**: Peringatan muncul otomatis saat kondisi berbahaya terdeteksi

### 🗺️ **Tab Lokasi**
- **Peta Interaktif**: Powered by Leaflet.js dengan marker lokasi
- **Zoom & Pan**: Navigasi peta yang smooth dan responsif
- **Marker Lokasi**: Menunjukkan posisi desa/kota yang dipilih
- **Tile Layer**: Menggunakan OpenStreetMap untuk detail peta yang akurat

### 📱 **Desain Responsif**
- **Mobile-First**: Dioptimalkan untuk penggunaan di smartphone
- **Touch-Friendly**: Interface yang mudah digunakan dengan sentuhan
- **Glassmorphism UI**: Desain modern dengan efek kaca transparan
- **Cross-Platform**: Berfungsi sempurna di desktop, tablet, dan mobile

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** - Framework JavaScript modern untuk UI interaktif
- **Tailwind CSS** - Framework CSS utility-first untuk styling yang fleksibel
- **React Leaflet** - Komponen React untuk peta interaktif
- **Axios** - HTTP client untuk komunikasi dengan API
- **ESLint** - Linting untuk kualitas kode yang konsisten

### Backend
- **Node.js** - Runtime JavaScript untuk server
- **Express.js** - Framework web untuk API RESTful
- **BMKG API** - Integrasi data cuaca resmi Indonesia
- **CORS** - Cross-Origin Resource Sharing untuk akses lintas domain

### UI/UX Design
- **Glassmorphism** - Efek visual kaca transparan yang modern
- **Mobile-First** - Pendekatan desain yang mengutamakan mobile
- **Responsive Grid** - Layout yang adaptif untuk semua ukuran layar

## 📂 Struktur Proyek

```
HujanGakYa/
├── frontend/                 # Aplikasi React frontend
│   ├── public/              # File statis (favicon, manifest)
│   ├── src/
│   │   ├── components/      # Komponen React reusable
│   │   ├── pages/          # Halaman utama aplikasi
│   │   │   └── Home.js     # Komponen utama dengan 3 tab
│   │   ├── styles/         # File CSS dan styling
│   │   └── App.js          # Root component
│   ├── package.json        # Dependencies frontend
│   └── tailwind.config.js  # Konfigurasi Tailwind CSS
├── backend/                # Server Express.js
│   ├── server.js          # Entry point server
│   ├── package.json       # Dependencies backend
│   └── data/              # Data statis dan cache
└── README.md              # Dokumentasi proyek
```

## 🚀 Instalasi & Setup

### Prasyarat
- **Node.js** (versi 16 atau lebih tinggi)
- **npm** atau **yarn** package manager
- **Browser modern** (Chrome, Firefox, Safari, Edge)

### Setup Backend
```bash
# Masuk ke direktori backend
cd backend

# Install dependencies
npm install

# Jalankan server
npm start
```
✅ Server berjalan di: `http://localhost:5000`

### Setup Frontend
```bash
# Masuk ke direktori frontend
cd frontend

# Install dependencies
npm install

# Jalankan aplikasi React
npm start
```
✅ Aplikasi berjalan di: `http://localhost:3000`

## 📖 Panduan Penggunaan

### 1. Mengakses Aplikasi
1. Buka browser dan kunjungi `http://localhost:3000`
2. Aplikasi akan menampilkan interface dengan 3 tab utama

### 2. Tab Cuaca 🌤️
**Cara Penggunaan:**
1. **Pencarian Lokasi**: 
   - Ketik nama desa/kota di kolom pencarian
   - Pilih lokasi dari dropdown hasil pencarian
   - Data cuaca akan dimuat otomatis

2. **Membaca Informasi Cuaca**:
   - **Suhu**: Ditampilkan dalam Celsius (°C)
   - **Kondisi Cuaca**: Deskripsi cuaca (cerah, berawan, hujan, dll)
   - **Kecepatan Angin**: Dalam km/jam dengan ikon arah angin
   - **Kelembaban**: Persentase dengan progress bar visual

3. **Auto-Refresh**:
   - Data diperbarui otomatis setiap beberapa menit
   - Indikator loading menunjukkan proses update data

### 3. Tab Peringatan ⚠️
**Sistem Alert Otomatis:**
1. **Monitoring Real-time**: Aplikasi memantau kondisi cuaca secara terus-menerus
2. **Kriteria Peringatan**:
   - 🔥 **Suhu Ekstrem**: Alert muncul jika suhu > 35°C
   - 🌊 **Cuaca Buruk**: Alert untuk hujan lebat, badai, atau cuaca ekstrem
   - 💨 **Angin Kencang**: Alert jika kecepatan angin > 25 km/jam

3. **Jenis Alert**:
   - **Peringatan Kuning**: Kondisi perlu perhatian
   - **Peringatan Merah**: Kondisi berbahaya, hindari aktivitas outdoor

4. **Cara Membaca Alert**:
   - Ikon dan warna menunjukkan tingkat bahaya
   - Deskripsi singkat memberikan saran tindakan
   - Timestamp menunjukkan kapan alert dikeluarkan

### 4. Tab Lokasi 🗺️
**Menggunakan Peta Interaktif:**
1. **Navigasi Peta**:
   - **Zoom In/Out**: Gunakan tombol + dan - atau scroll mouse
   - **Pan**: Klik dan drag untuk menggeser peta
   - **Touch Gestures**: Pinch to zoom dan swipe di mobile

2. **Marker Lokasi**:
   - Marker merah menunjukkan lokasi yang dipilih
   - Klik marker untuk melihat info lokasi
   - Peta otomatis terpusat pada lokasi yang dicari

3. **Koordinat**:
   - Latitude dan Longitude ditampilkan di info marker
   - Berguna untuk referensi posisi yang akurat

### 5. Tips Penggunaan Mobile 📱
1. **Responsif**: Semua fitur dapat diakses dengan mudah di smartphone
2. **Touch-Friendly**: Tombol dan area klik sudah dioptimalkan untuk sentuhan
3. **Portrait/Landscape**: Layout otomatis menyesuaikan orientasi layar
4. **Offline Handling**: Pesan error yang jelas jika tidak ada koneksi internet

## ⚙️ Development

### Kualitas Kode
- **ESLint**: Configured untuk frontend dan backend dengan zero warnings
- **Code Formatting**: Konsistensi style code di seluruh proyek
- **Clean Architecture**: Struktur kode yang mudah dipelihara dan dikembangkan
- **Error Handling**: Penanganan error yang komprehensif

### Testing
```bash
# Frontend
cd frontend
npm test

# Linting
npm run lint
npm run lint:fix
```

## API Endpoints

- `GET /api/weather?adm4=<code>` - Weather by ADM4 code
- `GET /api/weather/search?desa=<name>` - Search weather by village
- `GET /api/search-desa?q=<query>` - Search villages
- `GET /api/desa` - Get all villages
- `GET /api/health` - Health check

## 🤝 Contributing

### Kontribusi
1. **Fork** repository ini
2. **Create branch** untuk fitur baru (`git checkout -b feature/amazing-feature`)
3. **Commit** perubahan (`git commit -m 'Add amazing feature'`)
4. **Push** ke branch (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### Development Guidelines
- Ikuti ESLint rules yang sudah ditetapkan
- Tulis commit message yang deskriptif
- Test fitur baru sebelum submit PR
- Update dokumentasi jika diperlukan

### Bug Reports
Jika menemukan bug, silakan buat issue dengan:
- Deskripsi bug yang jelas
- Steps to reproduce
- Screenshot jika diperlukan
- Environment info (browser, OS, dll)

## 📄 License

Proyek ini bersifat open source di bawah **MIT License**.

## 📊 Data Sources

- **Data Cuaca**: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
- **Data Lokasi**: Indonesian Administrative Data (Kemendagri)
- **Peta**: OpenStreetMap contributors
- **Icons**: Weather icons dari berbagai open source libraries

## 🔄 Changelog

### Version 1.0.0 (Latest)
- ✅ Implementasi 3 tab utama (Cuaca, Peringatan, Lokasi)
- ✅ Integrasi BMKG API real-time
- ✅ Sistem alert otomatis untuk cuaca ekstrem
- ✅ Peta interaktif dengan Leaflet.js
- ✅ Mobile-first responsive design
- ✅ Glassmorphism UI dengan Tailwind CSS
- ✅ ESLint zero-warning compliance

## 📞 Support

Jika membutuhkan bantuan atau memiliki pertanyaan:
- **GitHub Issues**: Untuk bug reports dan feature requests
- **Documentation**: README ini untuk panduan lengkap
- **Community**: Diskusi di GitHub Discussions

---

**Dibuat dengan ❤️ untuk masyarakat Indonesia**  
*Membantu memberikan informasi cuaca yang akurat dan mudah diakses*
