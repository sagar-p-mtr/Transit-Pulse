# Real-Time Mobility & Crowd Analytics System

**A Final Year B.E. Project**

## Project Overview

This project presents a comprehensive real-time bus tracking and crowd analytics system designed for Indian metropolitan cities. The system addresses the common challenges faced by daily commuters such as unpredictable bus arrival times, overcrowded buses, and lack of route information.

The application provides live GPS tracking of BMTC (Bangalore Metropolitan Transport Corporation) buses, AI-powered crowd predictions, and intelligent route suggestions to help commuters plan their journeys efficiently.

## Problem Statement

Public transportation in Indian cities faces several challenges:
- Lack of real-time information about bus locations
- Uncertainty about bus arrival times at stops
- No visibility into crowd levels before boarding
- Language barriers for diverse user groups
- Difficulty in finding optimal routes

## Proposed Solution

Our system provides:
- **Real-time Bus Tracking:** Live GPS location of buses on interactive maps
- **Crowd Prediction:** AI/ML-based crowd level forecasting
- **Multi-language Support:** Interface available in Hindi, Tamil, Telugu, Kannada, and English
- **Smart Route Planning:** Weather-aware and crowd-aware route suggestions
- **Fare Calculator:** Accurate fare estimation between stops
- **AI Assistant:** Natural language chatbot for commute queries

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| Backend | Node.js, Express.js, SQLite |
| Real-time Communication | Socket.io, Firebase Firestore |
| Maps Integration | Google Maps JavaScript API |
| AI/ML | OpenRouter API (GPT-3.5-Turbo) |
| State Management | React Context, Zustand |
| Internationalization | react-i18next |

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Maps    │  │ AI Chat │  │ Crowd   │  │ Route   │        │
│  │ View    │  │ Bot     │  │ Display │  │ Planner │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (REST + WebSocket)              │
└─────────────────────────────────────────────────────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Google Maps │ │ OpenRouter  │ │  Firebase   │ │   SQLite    │
│     API     │ │   AI API    │ │  Firestore  │ │  Database   │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

## Features

### 1. Real-Time Bus Tracking
- Live bus locations displayed on Google Maps
- Color-coded markers based on crowd levels (Green/Yellow/Red)
- Automatic refresh every 10 seconds

### 2. AI-Powered Crowd Prediction
- Machine learning model predicts crowd levels
- Considers factors: time of day, day of week, weather, historical data
- Helps users avoid overcrowded buses

### 3. Intelligent Route Suggestions
- Weather-aware routing (suggests covered stops during rain)
- Crowd-aware alternatives during peak hours
- Multiple route options with ETA comparison

### 4. Multi-Language Interface
- Supports 5 Indian languages
- Auto-detects user's preferred language
- Easy language switching

### 5. AI Chatbot Assistant
- Natural language queries about routes
- Fare information and travel tips
- Powered by GPT-3.5-Turbo via OpenRouter

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Google Maps API key
- OpenRouter API key

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/sagar-p-mtr/Real-Time-Mobility---Crowd-Analytics-System.git
cd Real-Time-Mobility---Crowd-Analytics-System
```

2. **Install dependencies**
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

3. **Configure environment variables**

Create `.env` file in root directory:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
VITE_API_URL=http://localhost:5000
```

4. **Run the application**
```bash
# Start frontend development server
npm run dev
```

5. **Access the application**
```
http://localhost:5173
```

## Project Structure

```
Real-Time-Mobility---Crowd-Analytics-System/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── BusRouteMap.tsx      # Map display component
│   │   ├── BusBuddyAI.tsx       # AI chatbot component
│   │   ├── FareCalculator.tsx   # Fare calculation
│   │   └── ...                  # Other components
│   ├── services/                 # API service modules
│   │   ├── aiService.ts         # OpenRouter AI integration
│   │   ├── firebaseService.ts   # Firebase operations
│   │   └── ...                  # Other services
│   ├── hooks/                    # Custom React hooks
│   ├── contexts/                 # React context providers
│   └── i18n/                     # Language translations
├── backend/                      # Backend source code
│   ├── src/
│   │   ├── routes/              # Express route handlers
│   │   ├── services/            # Business logic
│   │   └── websocket/           # Socket.io handlers
│   └── database/                # Database schemas
├── package.json                  # Frontend dependencies
└── README.md                     # Project documentation
```

## Screenshots

*Screenshots to be added*

## Future Enhancements

- Integration with official BMTC GPS data
- Mobile application (React Native)
- Offline mode with PWA support
- Voice-based navigation
- Integration with metro and train systems

## Contributors

- **Sagar P** - Final Year B.E. Student

## Acknowledgments

- BMTC Bangalore for transportation data reference
- Google Maps Platform for mapping services
- OpenRouter for AI API access

## License

This project is developed for academic purposes as part of the B.E. Final Year Project.

---

**Department of Computer Science & Engineering**  
**B.E. Final Year Project - 2025-26**

---

**Final Year B.E. Project - Transit Pulse**
