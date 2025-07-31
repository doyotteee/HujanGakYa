# HujanGakYa 🌦️

Indonesian weather information application providing real-time weather data, alerts, and location-based weather forecasts.

## Features

- 🌤️ **Real-time Weather Data** - Live weather information from BMKG (Indonesian Meteorological Agency)
- 📍 **Location Search** - Search weather by village/city across Indonesia
- 🗺️ **Interactive Map** - Visual weather representation with location markers
- ⚠️ **Weather Alerts** - Automatic alerts for severe weather conditions
- 🚨 **Emergency Contacts** - Quick access to emergency services
- 📱 **Responsive Design** - Works seamlessly on mobile and desktop
- 📊 **Weather Charts** - Visual temperature and forecast trends

## Tech Stack

### Frontend
- React 19.1.0
- TailwindCSS
- ApexCharts
- React Leaflet
- Axios

### Backend
- Node.js
- Express.js
- BMKG API Integration
- JSON data storage

## Project Structure

```
HujanGakYa/
├── frontend/          # React frontend application
├── backend/           # Express.js backend API
└── README.md         # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm start
```
Server runs on http://localhost:5000

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs on http://localhost:3000

## Development

### Code Quality
- ESLint configured for both frontend and backend
- Consistent code formatting
- Clean, maintainable codebase

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Data Sources

- Weather data: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
- Location data: Indonesian Administrative Data
