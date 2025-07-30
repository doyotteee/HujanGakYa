import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom weather marker icon
const weatherIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function ClickMarker() {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click: (e) => {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup className="custom-popup">
        <div className="p-2">
          <div className="font-semibold text-gray-800 mb-2">📍 Selected Location</div>
          <div className="text-sm text-gray-600">
            <div>Latitude: {position.lat.toFixed(4)}</div>
            <div>Longitude: {position.lng.toFixed(4)}</div>
          </div>
          <div className="text-xs text-gray-500 mt-2 border-t pt-2">
            Click on weather markers to see detailed data
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function MapView({ data = [] }) {
  // Default center to Indonesia
  const center = [-2.5489, 118.0149];
  
  // If we have weather data, center on the first location
  const mapCenter = data.length > 0 && data[0].data?.lokasi && data[0].data.lokasi.lat && data[0].data.lokasi.lon
    ? [parseFloat(data[0].data.lokasi.lat), parseFloat(data[0].data.lokasi.lon)]
    : center;
  
  const mapZoom = data.length > 0 && data[0].data?.lokasi?.lat ? 12 : 5;

  return (
    <div className="rounded-xl overflow-hidden">
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ height: '400px', width: '100%' }}
        className="z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Weather markers from BMKG data */}
        {data.map((item, idx) => {
          const lokasi = item.data?.lokasi;
          if (!lokasi || !lokasi.lat || !lokasi.lon) return null;
          
          const latlon = [parseFloat(lokasi.lat), parseFloat(lokasi.lon)];
          const weatherData = item.data?.data?.[0];
          
          return (
            <Marker key={idx} position={latlon} icon={weatherIcon}>
              <Popup className="custom-popup">
                <div className="p-3 min-w-[250px]">
                  {/* Location Header */}
                  <div className="border-b pb-2 mb-3">
                    <h3 className="font-bold text-gray-800 text-lg">
                      🏙️ {lokasi.desa || item.location || item.adm4 || 'Unknown Location'}
                    </h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {lokasi.kecamatan && <div>Kec. {lokasi.kecamatan}</div>}
                      {(lokasi.kotkab || lokasi.kabupaten) && <div>{lokasi.kotkab || lokasi.kabupaten}</div>}
                      {lokasi.provinsi && <div>{lokasi.provinsi}</div>}
                    </div>
                  </div>
                  
                  {/* Coordinates */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-500">
                      📍 {lokasi.lat}, {lokasi.lon}
                    </div>
                    {item.adm4 && (
                      <div className="text-xs text-gray-500">
                        🆔 ADM4: {item.adm4}
                      </div>
                    )}
                  </div>
                  
                  {/* Weather Information */}
                  {weatherData && (
                    <div className="border-t pt-3">
                      <div className="font-semibold text-gray-700 mb-2">
                        🌤️ Current Weather
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-2 mb-2">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-blue-600">
                            {Math.round(weatherData.value || 25)}°C
                          </span>
                          <span className="text-sm text-gray-600 capitalize">
                            {weatherData.weather || 'Clear'}
                          </span>
                        </div>
                      </div>
                      
                      {weatherData.datetime && (
                        <div className="text-xs text-gray-500 mt-2">
                          🕒 {new Date(weatherData.datetime).toLocaleString('id-ID')}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Data source */}
                  <div className="border-t pt-2 mt-3">
                    <div className="text-xs text-gray-400 text-center">
                      Data from BMKG Indonesia
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Click marker for user interaction */}
        <ClickMarker />
      </MapContainer>
    </div>
  );
}

MapView.propTypes = {
  data: PropTypes.array
};

export default MapView;