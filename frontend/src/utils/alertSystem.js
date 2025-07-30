// Alert System untuk Penanggulangan Bencana
// Berdasarkan data cuaca BMKG

export const ALERT_LEVELS = {
  NORMAL: {
    priority: 0,
    color: 'green',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-100',
    icon: '✅',
    label: 'NORMAL'
  },
  WASPADA: {
    priority: 1,
    color: 'yellow',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-100',
    icon: '⚠️',
    label: 'WASPADA'
  },
  SIAGA: {
    priority: 2,
    color: 'orange',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-100',
    icon: '🟠',
    label: 'SIAGA'
  },
  AWAS: {
    priority: 3,
    color: 'red',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-100',
    icon: '🔴',
    label: 'AWAS'
  }
};

export const DISASTER_TYPES = {
  HUJAN_LEBAT: {
    name: 'Hujan Lebat',
    icon: '🌧️',
    description: 'Potensi genangan dan banjir'
  },
  ANGIN_KENCANG: {
    name: 'Angin Kencang',
    icon: '💨',
    description: 'Bahaya pohon tumbang dan benda terbang'
  },
  CUACA_EKSTREM: {
    name: 'Cuaca Ekstrem',
    icon: '⛈️',
    description: 'Kondisi cuaca sangat berbahaya'
  },
  VISIBILITY_RENDAH: {
    name: 'Jarak Pandang Rendah',
    icon: '🌫️',
    description: 'Kabut tebal, hati-hati berkendara'
  },
  POTENSI_BANJIR: {
    name: 'Potensi Banjir',
    icon: '🌊',
    description: 'Prediksi banjir berdasarkan pola hujan'
  },
  BANJIR_BESAR: {
    name: 'Banjir Besar',
    icon: '🌊',
    description: 'Potensi banjir besar dalam beberapa jam'
  }
};

// Fungsi untuk menganalisis data cuaca dan generate alerts
export const generateAlerts = (weatherData) => {
  const alerts = [];
  
  if (!weatherData?.data || !weatherData.data[0]?.cuaca) {
    return alerts;
  }

  // Ambil data cuaca forecast 24 jam
  const next24Hours = [];
  
  // Kumpulkan semua forecast dalam 24 jam
  weatherData.data[0].cuaca.forEach(dayArray => {
    dayArray.forEach(forecast => {
      const forecastTime = new Date(forecast.local_datetime);
      const now = new Date();
      const timeDiff = forecastTime - now;
      
      // Ambil forecast dalam 24 jam ke depan
      if (timeDiff >= 0 && timeDiff <= 24 * 60 * 60 * 1000) {
        next24Hours.push(forecast);
      }
    });
  });

  // FLOOD PREDICTION - Check first for predictive alerts
  const floodAlerts = analyzePotentialFlooding(next24Hours);
  alerts.push(...floodAlerts);

  // Rule 1: Hujan Lebat - berdasarkan curah hujan (tp) dan deskripsi
  const hasHeavyRain = next24Hours.some(f => 
    f.tp > 20 || 
    f.weather_desc?.toLowerCase().includes('hujan lebat') ||
    f.weather_desc?.toLowerCase().includes('heavy rain')
  );
  
  if (hasHeavyRain) {
    alerts.push({
      id: 'heavy_rain',
      level: 'SIAGA',
      type: 'HUJAN_LEBAT',
      title: 'Potensi Hujan Lebat',
      message: 'Hujan lebat diprediksi dalam 24 jam ke depan. Waspada genangan dan banjir lokal.',
      actions: [
        'Siapkan tas darurat dan senter',
        'Cek dan bersihkan saluran air',
        'Hindari area rendah saat hujan',
        'Pantau informasi cuaca terkini'
      ],
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      areas: ['Area rendah', 'Dekat sungai', 'Jalan utama']
    });
  }

  // Rule 2: Angin Kencang - berdasarkan kecepatan angin (ws)
  const hasStrongWind = next24Hours.some(f => f.ws > 25);
  const maxWindSpeed = Math.max(...next24Hours.map(f => f.ws || 0));
  
  if (hasStrongWind) {
    const windLevel = maxWindSpeed > 40 ? 'AWAS' : maxWindSpeed > 35 ? 'SIAGA' : 'WASPADA';
    
    alerts.push({
      id: 'strong_wind',
      level: windLevel,
      type: 'ANGIN_KENCANG',
      title: `Angin Kencang ${maxWindSpeed.toFixed(1)} km/h`,
      message: `Angin kencang hingga ${maxWindSpeed.toFixed(1)} km/h diprediksi. Waspada pohon tumbang dan benda terbang.`,
      actions: [
        'Hindari area pohon besar dan papan reklame',
        'Amankan barang yang mudah terbang',
        'Tutup rapat jendela dan pintu',
        'Hindari bangunan tinggi dan tidak stabil'
      ],
      validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000),
      areas: ['Area terbuka', 'Dekat pohon besar', 'Bangunan tinggi']
    });
  }

  // Rule 3: Jarak Pandang Rendah - berdasarkan visibility (vs)
  const hasLowVisibility = next24Hours.some(f => f.vs < 3000); // < 3km
  
  if (hasLowVisibility) {
    alerts.push({
      id: 'low_visibility',
      level: 'WASPADA',
      type: 'VISIBILITY_RENDAH',
      title: 'Jarak Pandang Rendah',
      message: 'Kabut tebal atau jarak pandang rendah. Hati-hati saat berkendara.',
      actions: [
        'Nyalakan lampu kendaraan',
        'Kurangi kecepatan berkendara',
        'Jaga jarak aman dengan kendaraan lain',
        'Gunakan klakson sebagai peringatan'
      ],
      validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000),
      areas: ['Jalan raya', 'Area pegunungan', 'Dekat sungai']
    });
  }

  // Rule 4: Cuaca Ekstrem - kombinasi multiple factors
  const hasExtremeWeather = next24Hours.some(f => 
    (f.tp > 50) || // Hujan sangat lebat
    (f.ws > 50) || // Angin sangat kencang
    (f.weather_desc?.toLowerCase().includes('badai')) ||
    (f.weather_desc?.toLowerCase().includes('storm'))
  );
  
  if (hasExtremeWeather) {
    alerts.push({
      id: 'extreme_weather',
      level: 'AWAS',
      type: 'CUACA_EKSTREM',
      title: 'Cuaca Ekstrem',
      message: 'Kondisi cuaca ekstrem terdeteksi! Tetap di dalam ruangan dan hindari aktivitas luar ruang.',
      actions: [
        'TETAP DI DALAM RUANGAN',
        'Siapkan makanan dan air untuk 24 jam',
        'Charge semua perangkat elektronik',
        'Hubungi keluarga untuk konfirmasi keselamatan',
        'Pantau informasi resmi dari BMKG/BPBD'
      ],
      validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
      areas: ['Seluruh wilayah']
    });
  }

  return alerts;
};

// NEW: Fungsi analisis prediksi banjir
const analyzePotentialFlooding = (forecastData) => {
  const alerts = [];
  
  // Analisis pola hujan
  const rainfallAnalysis = analyzeRainfallPattern(forecastData);
  
  // FLOOD PREDICTION RULES
  if (rainfallAnalysis.consecutiveHours >= 3 && rainfallAnalysis.totalRainfall > 30) {
    alerts.push({
      id: `flood_risk_${Date.now()}`,
      level: 'SIAGA',
      type: 'POTENSI_BANJIR',
      title: 'Potensi Banjir dalam 6-12 Jam',
      message: `Prediksi hujan selama ${rainfallAnalysis.consecutiveHours} jam dengan total ${rainfallAnalysis.totalRainfall}mm. Potensi banjir tinggi.`,
      prediction: {
        duration: `${rainfallAnalysis.consecutiveHours} jam`,
        totalRainfall: `${rainfallAnalysis.totalRainfall}mm`,
        floodRisk: calculateFloodRisk(rainfallAnalysis),
        estimatedTime: '6-12 jam dari sekarang'
      },
      actions: [
        'Siapkan tas darurat dan dokumen penting',
        'Pindahkan barang berharga ke tempat tinggi',
        'Pantau kondisi sungai/saluran air terdekat',
        'Siapkan jalur evakuasi alternatif',
        'Koordinasi dengan RT/RW setempat',
        'Siapkan makanan dan air untuk 72 jam'
      ],
      areas: ['Area rendah', 'Dekat sungai', 'Saluran air tersumbat'],
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
  }
  
  // SEVERE FLOOD WARNING
  if (rainfallAnalysis.consecutiveHours >= 6 && rainfallAnalysis.totalRainfall > 60) {
    alerts.push({
      id: `severe_flood_${Date.now()}`,
      level: 'AWAS', 
      type: 'BANJIR_BESAR',
      title: 'AWAS! Potensi Banjir Besar',
      message: `Hujan ekstrem ${rainfallAnalysis.consecutiveHours} jam dengan total ${rainfallAnalysis.totalRainfall}mm. Banjir besar sangat mungkin terjadi!`,
      prediction: {
        duration: `${rainfallAnalysis.consecutiveHours} jam`,
        totalRainfall: `${rainfallAnalysis.totalRainfall}mm`,
        floodRisk: 'SANGAT TINGGI',
        estimatedTime: '3-6 jam dari sekarang'
      },
      actions: [
        'SEGERA EVAKUASI ke tempat tinggi',
        'Hubungi RT/RW dan BPBD',
        'Matikan listrik dan gas',
        'Jangan berkendara di area berpotensi banjir',
        'Pantau info resmi dari BPBD',
        'Siaga di shelter/posko terdekat'
      ],
      areas: ['Seluruh area rendah', 'Bantaran sungai', 'Area langganan banjir'],
      validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000)
    });
  }
  
  return alerts;
};

// Fungsi analisis pola hujan
const analyzeRainfallPattern = (forecastData) => {
  let totalRainfall = 0;
  let maxConsecutive = 0;
  let currentStreak = 0;
  
  forecastData.forEach(forecast => {
    const rainfall = forecast.tp || 0;
    totalRainfall += rainfall;
    
    if (rainfall > 5) { // Hujan significant (>5mm)
      currentStreak++;
      maxConsecutive = Math.max(maxConsecutive, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  return {
    consecutiveHours: maxConsecutive,
    totalRainfall: Math.round(totalRainfall * 10) / 10,
    averageIntensity: totalRainfall / forecastData.length,
    peakIntensity: Math.max(...forecastData.map(f => f.tp || 0))
  };
};

// Fungsi hitung resiko banjir
const calculateFloodRisk = (analysis) => {
  const { consecutiveHours, totalRainfall, averageIntensity } = analysis;
  
  let risk = 0;
  
  // Durasi hujan
  if (consecutiveHours >= 6) risk += 40;
  else if (consecutiveHours >= 4) risk += 25;
  else if (consecutiveHours >= 2) risk += 15;
  
  // Total curah hujan
  if (totalRainfall >= 80) risk += 40;
  else if (totalRainfall >= 50) risk += 30;
  else if (totalRainfall >= 30) risk += 20;
  
  // Intensitas rata-rata
  if (averageIntensity >= 15) risk += 20;
  else if (averageIntensity >= 10) risk += 15;
  else if (averageIntensity >= 5) risk += 10;
  
  if (risk >= 80) return 'SANGAT TINGGI';
  if (risk >= 60) return 'TINGGI';
  if (risk >= 40) return 'SEDANG';
  if (risk >= 20) return 'RENDAH';
  return 'MINIMAL';
};

export const getHighestPriorityAlert = (alerts) => {
  if (!alerts.length) return null;
  
  return alerts.reduce((highest, current) => {
    const currentPriority = ALERT_LEVELS[current.level]?.priority || 0;
    const highestPriority = ALERT_LEVELS[highest.level]?.priority || 0;
    return currentPriority > highestPriority ? current : highest;
  });
};

export const getAlertConfig = (level) => {
  return ALERT_LEVELS[level] || ALERT_LEVELS.NORMAL;
};

export const getDisasterTypeConfig = (type) => {
  return DISASTER_TYPES[type] || {
    name: 'Unknown',
    icon: '⚠️',
    description: 'Kondisi cuaca memerlukan perhatian'
  };
};

export const formatTimeRemaining = (validUntil) => {
  const now = new Date();
  const diff = validUntil - now;
  
  if (diff <= 0) return 'Berakhir';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours} jam ${minutes} menit lagi`;
  }
  return `${minutes} menit lagi`;
};
