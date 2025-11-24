# Latest updates (demo-ready)
- Mock mode everywhere: searches, route selections, and live tracking auto-synthesize data when APIs/CORS fail, so the UI never shows "No buses found".
- Track Live from any route opens the tracker with bus info prefilled; if no backend data is returned, a synthetic bus is generated with source/destination and stops.
- Mock buses now derive journey metadata from fallback routes, enabling full timelines and maps without manual input.
- Light-mode readability touch-ups in Route Details/Track Live cards; cleaned live badges and arrows.
- Resilient error handling: backend/socket failures gracefully fall back to cached/mock data with user-friendly toasts instead of blank screens.
# 🚌 Where Is My Bus - India

> **The Ultimate Smart Bus Tracking App for Indian Cities**

A cutting-edge, real-time bus tracking application that transforms public transportation in India. Track buses live, check crowd levels, get AI-powered route suggestions, and much more!

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.5-orange.svg)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

---

## 🌟 Features

### 🚀 Core Features
- **📍 Real-Time Bus Tracking** - Live GPS tracking with smooth animations
- **🗺️ Interactive Maps** - Google Maps integration with route visualization
- **👥 Crowd Detection** - AI-powered crowd level prediction
- **⏱️ ETA Predictions** - Accurate arrival time estimates
- **🔍 Smart Search** - Find buses, routes, and stops instantly
- **🌙 Dark Mode** - Beautiful UI with automatic theme switching
- **🌍 Multi-Language** - Hindi, Tamil, Telugu, Kannada, English

### 🎯 Advanced Features
- **🤖 AI Bus Buddy** - Intelligent chatbot for route planning
- **📊 Analytics Dashboard** - Real-time statistics and insights
- **🎨 3D Bus Visualization** - Interactive 3D models
- **🥽 AR Navigation** - Augmented reality directions
- **👥 Social Features** - Share rides and travel updates
- **☁️ Weather Integration** - Weather-aware route suggestions
- **📱 Progressive Web App** - Install like a native app

### 🆕 New Live Tracking Feature
- **🎯 WhereIsMyTrain-style UI** - Beautiful, intuitive live tracking interface
- **📍 Real-time Position Updates** - WebSocket-powered live updates
- **🚏 Journey Progress** - Visual progress bar with stop-by-stop tracking
- **⚡ Smooth Animations** - 60fps bus movement on map
- **📊 Live Metrics** - Speed, crowd level, ETA in real-time

---

## 📁 Project Structure

```
project/
├── 📂 src/                    # Frontend source code
│   ├── components/            # React components
│   ├── services/              # API services
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom hooks
│   └── i18n/                  # Translations
│
├── 📂 backend/                # Backend server
│   ├── src/
│   │   ├── config/            # Configuration
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── websocket/         # WebSocket handlers
│   └── database/              # Database schemas
│
├── 📂 docs/                   # Documentation
│   ├── setup/                 # Setup guides
│   ├── guides/                # How-to guides
│   ├── features/              # Feature documentation
│   ├── architecture/          # Architecture docs
│   └── diagrams/              # UML diagrams
│
├── 📂 scripts/                # Utility scripts
├── 📂 archive/                # Archived files
├── 📂 public/                 # Static assets
└── 📄 README.md               # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase account
- Google Maps API key (optional for development)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/where-is-my-bus-india.git
cd where-is-my-bus-india
```

### 2️⃣ Install Frontend Dependencies
```bash
npm install
```

### 3️⃣ Install Backend Dependencies
```bash
cd backend
npm install
```

### 4️⃣ Configure Environment Variables

**Frontend** (`.env`):
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
```

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database Configuration
USE_FIREBASE=true
FIREBASE_PROJECT_ID=your_project_id

# JWT Configuration
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
```

### 5️⃣ Start Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm start
```

### 6️⃣ Open in Browser
Navigate to `http://localhost:5173` 🎉

---

## 🏗️ Tech Stack

### Frontend
- **⚛️ React 18** - UI framework
- **📘 TypeScript** - Type safety
- **🎨 Tailwind CSS** - Styling
- **🗺️ Google Maps API** - Maps integration
- **🔄 Socket.IO Client** - Real-time updates
- **🔥 Firebase** - Authentication & Database
- **🎭 Framer Motion** - Animations

### Backend
- **🟢 Node.js + Express** - Server framework
- **📡 Socket.IO** - WebSocket server
- **🔥 Firebase Admin SDK** - Database operations
- **🔐 JWT** - Authentication
- **📊 Redis** - Caching (optional)
- **📡 MQTT** - IoT device communication

---

## 📖 Documentation

### Setup Guides
- [Firebase Setup](docs/setup/FIREBASE_SETUP.md) - Configure Firebase
- [Backend Setup](docs/setup/BACKEND_SETUP_INSTRUCTIONS.md) - Backend configuration
- [Quick Start](docs/guides/QUICK_START_GUIDE.md) - Get started quickly

### Feature Guides
- [Live Tracking Feature](docs/features/WHERE_IS_MY_BUS_FEATURE.md) - New live tracking
- [AI Bus Buddy](docs/guides/AI_POWERED_BUS_BUDDY_GUIDE.md) - AI assistant
- [Multi-City Support](docs/guides/MULTI_CITY_GUIDE.md) - Multiple cities

### Architecture
- [Backend Architecture](docs/architecture/BACKEND_ARCHITECTURE_PROPOSAL.md)
- [System Design](docs/diagrams/) - UML diagrams

---

## 🎨 Key Features in Detail

### 🎯 Live Bus Tracking
Experience real-time bus tracking with a beautiful WhereIsMyTrain-style interface:
- **Live Position Updates** - See buses move in real-time on the map
- **Journey Progress** - Visual progress bar showing route completion
- **Stop-by-Stop Tracking** - Clear indicators for passed, current, and upcoming stops
- **Live Metrics** - Real-time speed, crowd level, and ETA
- **Smooth Animations** - Fluid 60fps bus movement with interpolation

### 🤖 AI-Powered Features
- **Smart Route Planning** - AI suggests best routes based on traffic and crowd
- **Crowd Prediction** - ML models predict bus occupancy
- **ETA Calculation** - Intelligent arrival time predictions
- **Natural Language Chat** - Ask questions in your local language

### 📱 Mobile-First Design
- **Responsive UI** - Works perfectly on all screen sizes
- **Touch Gestures** - Swipe, pinch, and tap interactions
- **PWA Support** - Install as a native app
- **Offline Mode** - Core features work without internet

---

## 🌍 Supported Cities

| City | Transport | Status |
|------|-----------|--------|
| 🏙️ **Bangalore** | BMTC, KSRTC | ✅ Active |
| 🏛️ **Delhi** | DTC, Cluster | ✅ Active |
| 🏢 **Mumbai** | BEST, MSRTC | ✅ Active |
| 🌊 **Chennai** | MTC, TNSTC | ✅ Active |
| 💎 **Hyderabad** | TSRTC | ✅ Active |
| 🎓 **Pune** | PMPML | ✅ Active |

---

## 🧪 Testing

```bash
# Frontend tests
npm run test

# Backend tests
cd backend
npm run test

# E2E tests
npm run test:e2e
```

---

## 📦 Building for Production

### Frontend
```bash
npm run build
```

### Backend
```bash
cd backend
npm run build
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **🍴 Fork the repository**
2. **🌿 Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **✍️ Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **📤 Push to branch** (`git push origin feature/amazing-feature`)
5. **🎉 Open a Pull Request**

Please read our [Contributing Guidelines](docs/guides/CONTRIBUTING.md) for details.

---

## 🐛 Bug Reports & Feature Requests

- **🐛 Bug Reports**: [Open an issue](https://github.com/your-username/where-is-my-bus-india/issues)
- **💡 Feature Requests**: [Open a discussion](https://github.com/your-username/where-is-my-bus-india/discussions)
- **💬 Questions**: Use [GitHub Discussions](https://github.com/your-username/where-is-my-bus-india/discussions)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Google Maps API for mapping services
- Firebase for backend infrastructure
- React community for amazing tools
- All contributors and supporters

---

## 📞 Contact & Support

- **📧 Email**: support@whereismybus.in
- **🐦 Twitter**: [@whereismybus](https://twitter.com/whereismybus)
- **💼 LinkedIn**: [Where Is My Bus](https://linkedin.com/company/whereismybus)

---

## 🎯 Roadmap

### Coming Soon
- [ ] 🚁 Helicopter view for traffic
- [ ] 💳 Digital payment integration
- [ ] 🤝 Carpooling features
- [ ] 🏆 Achievement system
- [ ] 📊 Personal analytics dashboard
- [ ] 🌦️ Advanced weather integration

### Future Plans
- [ ] Expand to 20+ cities
- [ ] iOS and Android native apps
- [ ] Smart city integrations
- [ ] Public transport pass system

---

<div align="center">

**Made with ❤️ by developers who believe public transport can be better**

⭐ Star us on GitHub if you like this project!

[Website](https://whereismybus.in) • [Documentation](docs/) • [Support](mailto:support@whereismybus.in)

</div>

