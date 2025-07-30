import React from 'react';
import PropTypes from 'prop-types';
import { getAlertConfig, getDisasterTypeConfig, formatTimeRemaining } from '../utils/alertSystem';

// Alert Banner di atas header - untuk alert priority tinggi
export const AlertBanner = ({ alerts }) => {
  if (!alerts.length) return null;
  
  // Ambil alert dengan priority tertinggi
  const highestAlert = alerts.reduce((prev, current) => {
    const prevPriority = getAlertConfig(prev.level).priority;
    const currentPriority = getAlertConfig(current.level).priority;
    return currentPriority > prevPriority ? current : prev;
  });

  const alertConfig = getAlertConfig(highestAlert.level);
  const disasterConfig = getDisasterTypeConfig(highestAlert.type);

  // Hanya tampilkan untuk SIAGA dan AWAS
  if (alertConfig.priority < 2) return null;

  return (
    <div className={`${alertConfig.bgColor} ${alertConfig.borderColor} border-b backdrop-blur-md animate-pulse`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center text-center">
          <span className="text-2xl mr-3 animate-bounce">{alertConfig.icon}</span>
          <div className="flex-1">
            <span className={`font-bold text-lg ${alertConfig.textColor}`}>
              PERINGATAN {alertConfig.label}
            </span>
            <span className="mx-3 text-white/70">•</span>
            <span className="text-white font-medium">
              {disasterConfig.icon} {highestAlert.title}
            </span>
          </div>
          <div className="text-sm text-white/80 ml-4">
            Berlaku {formatTimeRemaining(highestAlert.validUntil)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Alert Card untuk tab Peringatan
export const AlertCard = ({ alert }) => {
  const alertConfig = getAlertConfig(alert.level);
  const disasterConfig = getDisasterTypeConfig(alert.type);

  return (
    <div className={`backdrop-blur-xl ${alertConfig.bgColor} ${alertConfig.borderColor} border rounded-xl p-6 shadow-xl`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <span className="text-3xl mr-3">{disasterConfig.icon}</span>
          <div>
            <h3 className={`font-bold text-lg ${alertConfig.textColor}`}>
              {alertConfig.icon} {alertConfig.label}
            </h3>
            <p className="text-white font-medium">{alert.title}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/80">Berlaku hingga</div>
          <div className="text-sm font-medium text-white">
            {formatTimeRemaining(alert.validUntil)}
          </div>
        </div>
      </div>

      {/* Message */}
      <p className="text-white/90 mb-4 leading-relaxed">
        {alert.message}
      </p>

      {/* Flood Prediction Details */}
      {alert.prediction && (
        <div className="mb-4 p-4 bg-blue-900/30 rounded-lg border border-blue-400/30">
          <h4 className="font-semibold text-blue-200 text-sm mb-3 flex items-center">
            <span className="mr-2">📊</span>
            Detail Prediksi Banjir
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/10 p-2 rounded">
              <span className="text-blue-200 block text-xs">Durasi Hujan:</span>
              <p className="font-medium text-white">{alert.prediction.duration}</p>
            </div>
            <div className="bg-white/10 p-2 rounded">
              <span className="text-blue-200 block text-xs">Total Curah Hujan:</span>
              <p className="font-medium text-white">{alert.prediction.totalRainfall}</p>
            </div>
            <div className="bg-white/10 p-2 rounded">
              <span className="text-blue-200 block text-xs">Tingkat Resiko:</span>
              <p className={`font-medium ${
                alert.prediction.floodRisk === 'SANGAT TINGGI' ? 'text-red-300' :
                  alert.prediction.floodRisk === 'TINGGI' ? 'text-orange-300' :
                    alert.prediction.floodRisk === 'SEDANG' ? 'text-yellow-300' :
                      'text-green-300'
              }`}>
                {alert.prediction.floodRisk}
              </p>
            </div>
            <div className="bg-white/10 p-2 rounded">
              <span className="text-blue-200 block text-xs">Estimasi Waktu:</span>
              <p className="font-medium text-white">{alert.prediction.estimatedTime}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mb-4">
        <h4 className="font-semibold text-white mb-2">🚨 Tindakan yang Disarankan:</h4>
        <ul className="space-y-1">
          {alert.actions.map((action, index) => (
            <li key={index} className="flex items-start text-white/90">
              <span className="text-yellow-400 mr-2 mt-1">•</span>
              <span className="text-sm">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Areas */}
      {alert.areas && (
        <div>
          <h4 className="font-semibold text-white mb-2">📍 Area Rawan:</h4>
          <div className="flex flex-wrap gap-2">
            {alert.areas.map((area, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-white/20 rounded-full text-xs text-white border border-white/30"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Summary Alert untuk dashboard
export const AlertSummary = ({ alerts }) => {
  const alertCounts = alerts.reduce((acc, alert) => {
    acc[alert.level] = (acc[alert.level] || 0) + 1;
    return acc;
  }, {});

  const hasAlerts = alerts.length > 0;

  return (
    <div className="backdrop-blur-xl bg-white/20 rounded-xl p-4 border border-white/30">
      <h3 className="text-white font-semibold mb-3 flex items-center">
        <span className="mr-2">🚨</span>
        Status Peringatan
      </h3>
      
      {!hasAlerts ? (
        <div className="flex items-center text-green-200">
          <span className="text-xl mr-2">✅</span>
          <span className="font-medium">Kondisi Normal</span>
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(alertCounts).map(([level, count]) => {
            const config = getAlertConfig(level);
            return (
              <div key={level} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="mr-2">{config.icon}</span>
                  <span className={`font-medium ${config.textColor}`}>
                    {config.label}
                  </span>
                </div>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs text-white">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Emergency Contact Component
export const EmergencyContacts = ({ location }) => {
  const contacts = [
    { name: 'RT/RW Setempat', phone: '6281234567890', color: 'bg-green-600 hover:bg-green-700' },
    { name: 'BPBD Kabupaten', phone: '6281234567891', color: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'PMI Daerah', phone: '6281234567892', color: 'bg-red-600 hover:bg-red-700' },
    { name: 'Polsek Terdekat', phone: '6281234567893', color: 'bg-gray-600 hover:bg-gray-700' }
  ];

  const sendEmergencyReport = (contact) => {
    const message = `🚨 LAPORAN DARURAT BENCANA

📍 Lokasi: ${location?.desa || 'Unknown'}, ${location?.kecamatan || 'Unknown'}
📅 Waktu: ${new Date().toLocaleString('id-ID')}

⚠️ Kondisi Darurat:
[Silakan tuliskan kondisi darurat yang terjadi]

🆘 Bantuan yang Dibutuhkan:
[Tuliskan jenis bantuan yang diperlukan]

Mohon respon dan bantuan segera.
Terima kasih.

- Dilaporkan melalui HujanGakYa`;

    const whatsappUrl = `https://wa.me/${contact.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="backdrop-blur-xl bg-white/20 rounded-xl p-6 border border-white/30">
      <h3 className="text-white font-semibold mb-4 flex items-center">
        <span className="mr-2">📞</span>
        Kontak Darurat
      </h3>
      <div className="space-y-3">
        {contacts.map((contact, index) => (
          <button
            key={index}
            onClick={() => sendEmergencyReport(contact)}
            className={`w-full ${contact.color} text-white p-3 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg`}
          >
            <span className="mr-2">📱</span>
            Hubungi {contact.name}
          </button>
        ))}
      </div>
      <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
        <p className="text-yellow-100 text-xs text-center">
          ⚠️ Gunakan hanya untuk situasi darurat yang memerlukan bantuan segera
        </p>
      </div>
    </div>
  );
};

AlertBanner.propTypes = {
  alerts: PropTypes.array.isRequired
};

AlertCard.propTypes = {
  alert: PropTypes.object.isRequired
};

AlertSummary.propTypes = {
  alerts: PropTypes.array.isRequired
};

EmergencyContacts.propTypes = {
  location: PropTypes.object
};
