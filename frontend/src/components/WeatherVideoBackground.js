import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const WeatherVideoBackground = ({ weatherType, isVisible = true }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentVideoSrc, setCurrentVideoSrc] = useState(null);

  const getWeatherVideo = (weatherDescription) => {
    if (!weatherDescription) return null;
    
    const weather = weatherDescription.toLowerCase();
    
    // Mapping kondisi cuaca ke video files
    if (weather.includes('hujan lebat') || weather.includes('heavy rain')) {
      return '/videos/hujan-lebat.mp4';
    }
    
    if (weather.includes('petir') || weather.includes('thunder') || weather.includes('guntur')) {
      return '/videos/petir.mp4';
    }
    
    if (weather.includes('hujan') || weather.includes('rain')) {
      return '/videos/hujan.mp4';
    }
    
    if (weather.includes('gerimis') || weather.includes('drizzle')) {
      return '/videos/gerimis.mp4';
    }
    
    if (weather.includes('kabut') || weather.includes('fog') || weather.includes('mist') || weather.includes('berkabut')) {
      return '/videos/kabut.mp4';
    }
    
    // Specific check for "Cerah Berawan" - harus dicek dulu sebelum "berawan" atau "cerah"
    if (weather.includes('cerah berawan') || weather.includes('partly cloudy')) {
      return '/videos/cerah-berawan.mp4';
    }
    
    // Pure "Berawan" - fully cloudy
    if (weather.includes('berawan') || weather.includes('mostly cloudy') || weather.includes('mendung')) {
      return '/videos/berawan.mp4';
    }

    // Pure "Cerah" - clear/sunny
    if (weather.includes('cerah') || weather.includes('clear') || weather.includes('sunny')) {
      return '/videos/cerah.mp4';
    }
    
    // Default fallback
    return '/videos/berawan.mp4';
  };  useEffect(() => {
    const newVideoSrc = getWeatherVideo(weatherType);
    
    if (newVideoSrc !== currentVideoSrc) {
      setVideoLoaded(false);
      setCurrentVideoSrc(newVideoSrc);
    }
  }, [weatherType, currentVideoSrc]);

  if (!currentVideoSrc || !isVisible) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <video
        key={currentVideoSrc} // Force re-render when video changes
        className={`w-full h-full object-cover transition-opacity duration-1000 ${
          videoLoaded ? 'opacity-70' : 'opacity-0'
        }`}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setVideoLoaded(true)}        onError={(e) => {
          // Fallback logic untuk video yang tidak ada
          if (currentVideoSrc.includes('malam-cerah') || currentVideoSrc.includes('golden-hour')) {
            setCurrentVideoSrc('/videos/cerah.mp4');
          } else if (currentVideoSrc.includes('hujan-lebat')) {
            setCurrentVideoSrc('/videos/hujan.mp4'); 
          } else if (currentVideoSrc.includes('petir')) {
            setCurrentVideoSrc('/videos/berawan.mp4');
          } else if (currentVideoSrc.includes('kabut') || currentVideoSrc.includes('gerimis')) {
            setCurrentVideoSrc('/videos/berawan.mp4');
          } else {
            setCurrentVideoSrc('/videos/berawan.mp4');
            setVideoLoaded(false);
          }
        }}        style={{ 
          filter: 'brightness(0.9)',
          transform: 'scale(1.01)' // Minimal zoom
        }}
      >
        <source src={currentVideoSrc} type="video/mp4" />
        {/* Fallback untuk browser yang tidak support video */}
        Your browser does not support video backgrounds.
      </video>      {/* Minimal overlay untuk readability */}
      <div className="absolute inset-0 bg-black/5"></div>
    </div>
  );
};

WeatherVideoBackground.propTypes = {
  weatherType: PropTypes.string,
  isVisible: PropTypes.bool
};

export default WeatherVideoBackground;
