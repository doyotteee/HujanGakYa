const axios = require('axios');

/**
 * Service untuk mengambil data cuaca dari API BMKG
 */
class BMKGService {
  constructor() {
    this.baseURL = 'https://api.bmkg.go.id/publik/prakiraan-cuaca';
    this.timeout = 15000;
  }

  /**
   * Mengambil data cuaca berdasarkan kode ADM4
   */
  async getWeatherByAdm4(adm4Code) {
    if (!adm4Code) {
      throw new Error('Kode ADM4 diperlukan');
    }

    try {
      console.log(`🌤️  Fetching weather data for ADM4: ${adm4Code}`);
      
      const response = await axios.get(`${this.baseURL}?adm4=${adm4Code}`, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'CuacaMap-Backend/2.0.0',
          'Accept': 'application/json'
        }
      });

      if (!response.data) {
        throw new Error('Tidak ada data yang diterima dari API BMKG');
      }

      const processedData = this.processWeatherData(response.data, adm4Code);
      console.log(`✅ Successfully processed weather data for ${adm4Code}`);
      
      return processedData;

    } catch (error) {
      console.error(`❌ Error fetching weather data for ${adm4Code}:`, error.message);
      throw new Error(`Gagal mengambil data cuaca: ${error.message}`);
    }
  }

  /**
   * Memproses data cuaca mentah dari BMKG
   */
  processWeatherData(rawData, adm4Code) {
    const result = {
      adm4: adm4Code,
      timestamp: new Date().toISOString(),
      lokasi: null,
      forecast: [],
      currentWeather: null,
      summary: null
    };

    // Proses informasi lokasi
    if (rawData.lokasi) {
      result.lokasi = {
        desa: rawData.lokasi.desa || 'N/A',
        kecamatan: rawData.lokasi.kecamatan || 'N/A',
        kotkab: rawData.lokasi.kotkab || 'N/A',
        provinsi: rawData.lokasi.provinsi || 'N/A',
        lat: rawData.lokasi.lat || null,
        lon: rawData.lokasi.lon || null,
        timezone: rawData.lokasi.timezone || 'Asia/Jakarta',
        adm1: rawData.lokasi.adm1 || null,
        adm2: rawData.lokasi.adm2 || null,
        adm3: rawData.lokasi.adm3 || null,
        adm4: rawData.lokasi.adm4 || adm4Code
      };
    }

    // Proses data prakiraan cuaca
    if (rawData.data && rawData.data.length > 0 && rawData.data[0].cuaca) {
      const cuacaData = rawData.data[0].cuaca;
      
      cuacaData.forEach((dailyData, dayIndex) => {
        const dayForecast = {
          day: dayIndex + 1,
          date: null,
          forecasts: []
        };

        if (Array.isArray(dailyData)) {
          dailyData.forEach((forecast) => {
            const processedForecast = {
              datetime: forecast.datetime,
              local_datetime: forecast.local_datetime,
              utc_datetime: forecast.utc_datetime,
              temperature: {
                celsius: forecast.t,
                fahrenheit: Math.round((forecast.t * 9/5) + 32)
              },
              weather: {
                code: forecast.weather,
                description: forecast.weather_desc,
                description_en: forecast.weather_desc_en,
                image: forecast.image
              },
              wind: {
                speed: forecast.ws,
                direction: forecast.wd,
                direction_deg: forecast.wd_deg,
                direction_to: forecast.wd_to
              },
              humidity: forecast.hu,
              cloud_cover: forecast.tcc,
              precipitation: forecast.tp,
              visibility: {
                value: forecast.vs,
                text: forecast.vs_text
              },
              time_index: forecast.time_index,
              analysis_date: forecast.analysis_date
            };
            
            dayForecast.forecasts.push(processedForecast);
            
            // Set tanggal dari forecast pertama
            if (!dayForecast.date && forecast.local_datetime) {
              dayForecast.date = forecast.local_datetime.split(' ')[0];
            }
          });
        }

        result.forecast.push(dayForecast);
      });
      
      // Set current weather dari forecast pertama yang tersedia
      console.log(`🔍 Setting current weather from ${result.forecast.length} forecast days`);
      
      for (let i = 0; i < result.forecast.length; i++) {
        if (result.forecast[i].forecasts && result.forecast[i].forecasts.length > 0) {
          result.currentWeather = result.forecast[i].forecasts[0];
          console.log(`✅ Current weather set from day ${i + 1}: ${result.currentWeather.weather.description}`);
          break;
        }
      }
      
      if (!result.currentWeather) {
        console.log('❌ Could not set current weather - no forecasts available');
      }
    }

    // Tambahkan summary
    result.summary = this.createSummary(result);
    
    return result;
  }

  /**
   * Membuat summary dari data cuaca
   */
  createSummary(weatherData) {
    if (!weatherData.currentWeather) {
      return {
        current_temp: 'N/A',
        current_weather: 'N/A',
        today_forecast_count: 0,
        total_days: weatherData.forecast?.length || 0
      };
    }

    const current = weatherData.currentWeather;
    
    return {
      current_temp: `${current.temperature.celsius}°C`,
      current_weather: current.weather.description,
      current_humidity: `${current.humidity}%`,
      current_wind: `${current.wind.speed} km/h ${current.wind.direction}`,
      today_forecast_count: weatherData.forecast[0]?.forecasts?.length || 0,
      total_days: weatherData.forecast?.length || 0,
      location: weatherData.lokasi ? 
        `${weatherData.lokasi.desa}, ${weatherData.lokasi.kecamatan}, ${weatherData.lokasi.kotkab}` : 'N/A'
    };
  }

  /**
   * Test koneksi ke API BMKG
   */
  async testConnection() {
    try {
      const response = await axios.get(this.baseURL, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Extract semua data per 3 jam dari response BMKG
   * Method khusus untuk mendapatkan data hourly dalam format flat
   */
  extractAllHourlyData(rawData, adm4Code) {
    const allHourlyData = [];
    
    if (!rawData.data || !rawData.data[0] || !rawData.data[0].cuaca) {
      console.log('❌ No cuaca data found in BMKG response');
      return allHourlyData;
    }

    const cuacaData = rawData.data[0].cuaca;
    console.log(`📊 Processing ${cuacaData.length} days of weather data`);
    
    cuacaData.forEach((dailyData, dayIndex) => {
      if (Array.isArray(dailyData)) {
        console.log(`📅 Day ${dayIndex + 1}: ${dailyData.length} forecast slots`);
        
        dailyData.forEach((forecast, slotIndex) => {
          const hourlyItem = {
            day: dayIndex + 1,
            slot: slotIndex + 1,
            datetime: forecast.datetime || null,
            local_datetime: forecast.local_datetime || null,
            utc_datetime: forecast.utc_datetime || null,
            temperature: {
              celsius: forecast.t || null,
              fahrenheit: forecast.t ? Math.round((forecast.t * 9/5) + 32) : null
            },
            weather: {
              code: forecast.weather || null,
              description: forecast.weather_desc || 'N/A',
              description_en: forecast.weather_desc_en || 'N/A',
              icon_url: forecast.image || null
            },
            wind: {
              speed: forecast.ws || 0,
              direction: forecast.wd || 'N/A',
              direction_deg: forecast.wd_deg || null,
              direction_to: forecast.wd_to || 'N/A'
            },
            humidity: forecast.hu || null,
            cloud_cover: forecast.tcc || null,
            precipitation: forecast.tp || 0,
            visibility: {
              value: forecast.vs || null,
              text: forecast.vs_text || 'N/A'
            },
            time_index: forecast.time_index || null,
            analysis_date: forecast.analysis_date || null,
            // Metadata tambahan
            date: forecast.local_datetime ? forecast.local_datetime.split(' ')[0] : null,
            time: forecast.local_datetime ? forecast.local_datetime.split(' ')[1] : null,
            hour: forecast.local_datetime ? parseInt(forecast.local_datetime.split(' ')[1].split(':')[0]) : null
          };
          
          allHourlyData.push(hourlyItem);
        });
      }
    });
    
    console.log(`✅ Extracted ${allHourlyData.length} hourly forecast items`);
    return allHourlyData;
  }
}

module.exports = new BMKGService();
