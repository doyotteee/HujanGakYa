# 🗺️ Daftar Kode ADM4 Indonesia - CuacaMap

## 📍 Kode ADM4 yang Telah Ditest dan Valid

### 🏛️ DKI Jakarta
- **Jakarta Pusat (Gambir)**: `31.71.01.1001`
- **Jakarta Barat (Kembangan Utara)**: `31.73.08.1001`
- **Jakarta Selatan**: `31.72.xx.xxxx` (perlu dicari)
- **Jakarta Timur**: `31.74.xx.xxxx` (perlu dicari)
- **Jakarta Utara**: `31.75.xx.xxxx` (perlu dicari)

### 🏔️ Jawa Barat
- **Bandung (Hegarmanah)**: `32.73.08.1001`
- **Bogor**: `32.01.xx.xxxx` (perlu dicari)
- **Bekasi**: `32.75.xx.xxxx` (perlu dicari)
- **Depok**: `32.76.xx.xxxx` (perlu dicari)

### 🌊 Jawa Tengah
- **Semarang (Miroto)**: `33.74.01.1001` ✅ Tested
- **Solo**: `33.72.xx.xxxx` (perlu dicari)

### 🏛️ D.I. Yogyakarta  
- **Yogyakarta (Kricak)**: `34.71.01.1001` ✅ Tested

### 🌴 Jawa Timur
- **Surabaya (Karang Pilang)**: `35.78.01.1001` ✅ Tested
- **Malang**: `35.73.xx.xxxx` (perlu dicari)

## 🔍 Format Kode ADM4

Format: `AA.BB.CC.DDDD`
- **AA**: Kode Provinsi (31=DKI, 32=Jabar, 33=Jateng, 34=DIY, 35=Jatim)
- **BB**: Kode Kabupaten/Kota
- **CC**: Kode Kecamatan  
- **DDDD**: Kode Desa/Kelurahan

## 🧪 Testing Multi-Kode

Anda bisa test beberapa kode sekaligus dengan memisahkan menggunakan koma:

**Contoh:**
```
31.73.08.1001,31.71.01.1001,32.73.08.1001
```

## 🔗 API Endpoints

**Backend Server**: `http://localhost:5000`
**Frontend App**: `http://localhost:3000`

**API Test:**
```bash
# Single location
curl "http://localhost:5000/api/weather?adm4=31.73.08.1001"

# Multiple locations  
curl "http://localhost:5000/api/weather?adm4=31.73.08.1001,31.71.01.1001"
```

## ❌ Troubleshooting

### Kode Tidak Bisa Diambil?

1. **Cek Format Kode**: Pastikan format `AA.BB.CC.DDDD` benar
2. **Cek Server Backend**: Pastikan berjalan di port 5000
3. **Test API Langsung**: 
   ```bash
   curl "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=KODE_ANDA"
   ```
4. **Cek Log Backend**: Lihat console untuk error messages

### Response Error Format:
```json
[
  {
    "adm4": "99.99.99.9999",
    "error": "Gagal mengambil data dari BMKG"
  }
]
```

### Response Success Format:
```json
[
  {
    "adm4": "31.73.08.1001", 
    "data": {
      "lokasi": { ... },
      "data": [ ... ]
    }
  }
]
```

## 🔎 Cara Mencari Kode ADM4

1. **Website BMKG**: Cek prakiraan cuaca di website resmi
2. **API Explorer**: Test berbagai kombinasi kode
3. **Database BPS**: Referensi kode wilayah administrasi

## 📝 Notes

- ✅ Multi-kode ADM4 didukung (pisahkan dengan koma)
- ✅ Error handling untuk kode tidak valid
- ✅ Semua kode yang ditest berhasil
- ✅ Backend-frontend integration berfungsi normal
