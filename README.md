# 🚌 Where Is My Bus - India

<div align="center">

![Where Is My Bus Banner](https://img.shields.io/badge/Where_Is_My_Bus-Smart_Transport-blue?style=for-the-badge)

**Transform Your Daily Commute with Real-Time Bus Tracking**

[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.5-FFCA28?style=flat&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [About](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About The Project

**Where Is My Bus** is a comprehensive, real-time bus tracking application designed specifically for Indian cities. Built as a Final Year Project, this full-stack solution combines modern web technologies with AI/ML capabilities to revolutionize public transportation experience.

### 🌟 Why This Project?

Public transportation in India faces several challenges:
- ❌ Unpredictable arrival times
- ❌ Overcrowded buses during peak hours
- ❌ Limited real-time information
- ❌ Language barriers for tourists and migrants

**Our Solution:**
- ✅ Real-time GPS tracking of buses
- ✅ AI-powered crowd prediction
- ✅ Multi-language support (Hindi, Tamil, Telugu, Kannada, English)
- ✅ Intelligent route planning
- ✅ Beautiful, intuitive UI inspired by WhereIsMyTrain

---

## ✨ Features

### 🚀 **Core Features**

<table>
<tr>
<td width="50%">

#### 📍 Real-Time Tracking
- Live GPS tracking with WebSocket updates
- Smooth 60fps bus movement animations
- Multi-bus tracking on single map
- Route visualization with polylines

</td>
<td width="50%">

#### 🗺️ Interactive Maps
- Google Maps integration
- Custom bus stop markers
- Route highlighting
- Traffic layer support

</td>
</tr>
<tr>
<td width="50%">

#### 👥 Crowd Intelligence
- AI-powered crowd prediction
- Historical data analysis
- Real-time occupancy levels
- Peak hour alerts

</td>
<td width="50%">

#### ⏱️ Smart ETA
- ML-based arrival predictions
- Traffic-aware calculations
- Dynamic route optimization
- Weather impact consideration

</td>
</tr>
</table>

### 🎯 **Advanced Features**

- **🤖 AI Bus Buddy** - Natural language chatbot for route planning and queries
- **📊 Analytics Dashboard** - Real-time statistics, insights, and usage patterns
- **🌙 Dark/Light Mode** - Beautiful UI with automatic theme switching
- **🌍 Multi-Language Support** - Hindi, Tamil, Telugu, Kannada, English
- **🔍 Smart Search** - Fuzzy search for buses, routes, and stops
- **📱 Progressive Web App** - Install like a native app, works offline
- **🎨 3D Visualizations** - Interactive 3D bus models and route views
- **🥽 AR Navigation** - Augmented reality directions (experimental)
- **👥 Social Features** - Share rides, rate journeys, community updates
- **☁️ Weather Integration** - Weather-aware route suggestions
- **🔔 Smart Notifications** - Push notifications for bus arrivals and delays
- **💳 Payment Integration** - Digital ticket booking (Razorpay)

### 🆕 **Live Tracking Feature**

<div align="center">

**WhereIsMyTrain-Inspired Beautiful UI**

</div>

- **📍 Real-time Position Updates** - WebSocket-powered smooth tracking
- **🚏 Journey Progress Bar** - Visual progress with stop-by-stop tracking
- **⚡ 60fps Animations** - Fluid bus movement with interpolation
- **📊 Live Metrics** - Real-time speed, crowd level, ETA, and distance
- **🎯 Auto-Focus** - Camera follows bus automatically
- **🔄 Fallback Mode** - Mock data when backend unavailable

---

## 🛠️ Tech Stack

### **Frontend**
```
⚛️  React 18.3          - UI Framework
📘  TypeScript 5.5      - Type Safety
🎨  Tailwind CSS        - Styling Framework
🗺️  Google Maps API     - Maps & Geolocation
🔄  Socket.IO Client    - Real-time Communication
🔥  Firebase SDK        - Authentication & Database
🎭  Framer Motion       - Animations
📊  Recharts            - Data Visualization
🌐  i18next             - Internationalization
🔍  Fuse.js             - Fuzzy Search
⚡  Vite                - Build Tool
```

### **Backend**
```
🟢  Node.js + Express   - Server Framework
📡  Socket.IO           - WebSocket Server
🔥  Firebase Admin SDK  - Database Operations
🔐  JWT                 - Authentication
📊  SQLite              - Local Database (Development)
📡  MQTT                - IoT Device Communication
🔔  Twilio              - SMS Notifications
💳  Razorpay            - Payment Gateway
🤖  Custom AI/ML        - Prediction Models
📝  Morgan              - HTTP Logging
🛡️  Helmet              - Security Headers
```

### **DevOps & Tools**
```
🐳  Docker              - Containerization
📋  ESLint              - Code Linting
💅  PostCSS             - CSS Processing
🔧  dotenv              - Environment Management
```

---

## 📁 Project Structure

<details>
<summary><b>Click to expand full structure</b></summary>

```
where-is-my-bus-india/
│
├── 📂 src/                          # Frontend Source Code
│   ├── 📂 components/               # React Components
│   │   ├── 📂 ar/                   # AR Features
│   │   ├── 📂 auth/                 # Authentication
│   │   ├── 📂 bus/                  # Bus Components
│   │   ├── 📂 dashboard/            # Dashboard
│   │   ├── 📂 live/                 # Live Tracking (NEW!)
│   │   ├── 📂 maps/                 # Map Components
│   │   ├── 📂 social/               # Social Features
│   │   └── 📂 ui/                   # UI Components
│   ├── 📂 services/                 # API Services
│   │   ├── api.ts                   # Base API client
│   │   ├── busService.ts            # Bus API
│   │   ├── liveTrackingService.ts   # Live tracking API
│   │   └── socketService.ts         # WebSocket client
│   ├── 📂 contexts/                 # React Contexts
│   │   ├── AuthContext.tsx          # Authentication
│   │   ├── ThemeContext.tsx         # Theme management
│   │   └── LanguageContext.tsx      # i18n
│   ├── 📂 hooks/                    # Custom Hooks
│   ├── 📂 i18n/                     # Translations
│   ├── 📂 utils/                    # Utility Functions
│   ├── App.tsx                      # Main App Component
│   └── main.tsx                     # Entry Point
│
├── 📂 backend/                      # Backend Server
│   ├── 📂 src/
│   │   ├── 📂 config/               # Configuration
│   │   │   ├── database.js          # Database config
│   │   │   ├── firebase.js          # Firebase config
│   │   │   └── redis.js             # Redis config
│   │   ├── 📂 routes/               # API Routes
│   │   │   ├── buses.js             # Bus routes
│   │   │   ├── liveTracking.js      # Live tracking
│   │   │   ├── auth.js              # Authentication
│   │   │   ├── ml.js                # ML predictions
│   │   │   └── ...
│   │   ├── 📂 services/             # Business Logic
│   │   │   ├── gpsSimulator.js      # GPS simulation
│   │   │   ├── iotService.js        # IoT integration
│   │   │   ├── aiEnhancedBusBuddy.js
│   │   │   └── ...
│   │   ├── 📂 websocket/            # WebSocket
│   │   │   ├── socketHandler.js
│   │   │   └── liveTrackingHandler.js
│   │   └── app.js                   # Express App
│   ├── 📂 database/                 # Database
│   │   ├── schema.sql               # Schema
│   │   ├── init_sqlite.js           # Initialization
│   │   └── populate_sqlite.js       # Seed data
│   ├── 📂 scripts/                  # Scripts
│   ├── .env                         # Environment vars
│   └── package.json
│
├── 📂 docs/                         # Documentation
│   ├── 📂 setup/                    # Setup Guides
│   ├── 📂 guides/                   # User Guides
│   ├── 📂 features/                 # Feature Docs
│   ├── 📂 architecture/             # Architecture
│   └── 📂 diagrams/                 # UML Diagrams
│
├── 📂 scripts/                      # Utility Scripts
├── 📂 public/                       # Static Assets
├── 📄 package.json                  # Frontend deps
├── 📄 tsconfig.json                 # TypeScript config
├── 📄 vite.config.ts                # Vite config
├── 📄 tailwind.config.js            # Tailwind config
├── 📄 .env.example                  # Env template
└── 📄 README.md                     # This file
```

</details>

---

## 🚀 Installation

### 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** ([Download](https://git-scm.com/))
- **Firebase Account** (Free tier works!) ([Sign up](https://firebase.google.com/))
- **Google Maps API Key** (Optional for development) ([Get key](https://developers.google.com/maps))

### 🔧 Step-by-Step Setup

#### 1️⃣ Clone the Repository

```bash
# Clone the repo
git clone https://github.com/your-username/where-is-my-bus-india.git

# Navigate to project directory
cd where-is-my-bus-india
```

#### 2️⃣ Install Frontend Dependencies

```bash
# Install frontend packages
npm install
```

#### 3️⃣ Install Backend Dependencies

```bash
# Navigate to backend folder
cd backend

# Install backend packages
npm install

# Return to root directory
cd ..
```

#### 4️⃣ Configure Environment Variables

Create `.env` file in the **root directory**:

```env
# Frontend Environment Variables
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Create `.env` file in the **backend** directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database Configuration
USE_FIREBASE=true
FIREBASE_PROJECT_ID=your_project_id
DB_TYPE=sqlite

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_PATH=./path-to-service-account.json

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_REFRESH_SECRET=your_refresh_secret_key_change_this
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# Optional Services
REDIS_URL=redis://localhost:6379
MQTT_BROKER_URL=mqtt://localhost:1883
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

> 💡 **Tip:** Copy `.env.example` files if provided and rename them to `.env`

#### 5️⃣ Initialize Database

```bash
# Navigate to backend
cd backend

# Initialize SQLite database
npm run init-db

# Populate with demo data
npm run setup-db

# Return to root
cd ..
```

#### 6️⃣ Start Development Servers

Open **two terminal windows**:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

#### 7️⃣ Open in Browser

Navigate to **http://localhost:5173** 🎉

You should see the app running! Try searching for buses or exploring the live tracking feature.

---

## ⚙️ Configuration

### 🔑 Getting API Keys

<details>
<summary><b>Firebase Setup</b></summary>

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication (Email/Password, Google, Phone)
4. Create Firestore Database
5. Go to Project Settings → General → Your apps
6. Copy configuration values to `.env` file
7. Generate service account key for backend (Settings → Service Accounts)

Detailed guide: [Firebase Setup Documentation](docs/setup/FIREBASE_SETUP.md)

</details>

<details>
<summary><b>Google Maps API</b></summary>

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
   - Places API
4. Create credentials (API Key)
5. Restrict API key (optional but recommended)
6. Copy key to `VITE_GOOGLE_MAPS_API_KEY` in `.env`

</details>

<details>
<summary><b>Optional Services</b></summary>

**Twilio (SMS Notifications)**
- Sign up at [Twilio](https://www.twilio.com/)
- Get Account SID and Auth Token
- Add to backend `.env`

**Razorpay (Payments)**
- Sign up at [Razorpay](https://razorpay.com/)
- Get Key ID and Secret
- Add to backend `.env`

</details>

---

## 📖 Documentation

### 📚 Complete Documentation

| Category | Description | Link |
|----------|-------------|------|
| 🚀 **Setup** | Installation and configuration guides | [Setup Docs](docs/setup/) |
| 📖 **Features** | Detailed feature documentation | [Feature Docs](docs/features/) |
| 🏗️ **Architecture** | System design and architecture | [Architecture Docs](docs/architecture/) |
| 🎨 **Diagrams** | UML and system diagrams | [Diagrams](docs/diagrams/) |
| 🛠️ **Guides** | Step-by-step implementation guides | [Guides](docs/guides/) |

**Quick Links:**
- [Firebase Setup Guide](docs/setup/FIREBASE_SETUP.md)
- [Backend Setup Instructions](docs/setup/BACKEND_SETUP_INSTRUCTIONS.md)
- [Live Tracking Feature](docs/features/WHERE_IS_MY_BUS_FEATURE.md)
- [AI Bus Buddy Guide](docs/guides/AI_POWERED_BUS_BUDDY_GUIDE.md)
- [Backend Architecture](docs/architecture/BACKEND_ARCHITECTURE_PROPOSAL.md)

---

## 🎯 Usage

### Basic Operations

```bash
# Start frontend development server
npm run dev

# Build frontend for production
npm run build

# Preview production build
npm run preview

# Lint frontend code
npm run lint
```

```bash
# Backend commands
cd backend

# Start backend server
npm start

# Start with auto-reload (development)
npm run dev

# Initialize database
npm run init-db

# Populate database with demo data
npm run setup-db

# Run tests
npm run test
```

### Common User Workflows

**1. Search for a Bus**
- Open app → Click search bar
- Type bus number or route name
- View results with real-time availability

**2. Track Bus Live**
- Search for bus → Click on result
- Click "Track Live" button
- View real-time location and ETA

**3. Plan a Journey**
- Click "Plan Journey"
- Enter source and destination
- View route suggestions with crowd levels

**4. Use AI Bus Buddy**
- Click chat icon
- Ask questions in natural language
- Get intelligent route recommendations

---

## 📸 Screenshots

<div align="center">

### 🏠 Home Screen
![Home Screen](docs/screenshots/home.png)

### 🗺️ Live Tracking
![Live Tracking](docs/screenshots/live-tracking.png)

### 🤖 AI Bus Buddy
![AI Bus Buddy](docs/screenshots/ai-buddy.png)

### 📊 Analytics Dashboard
![Dashboard](docs/screenshots/dashboard.png)

> 📝 **Note:** Add actual screenshots to `docs/screenshots/` folder

</div>

---

## 🌍 Supported Cities

<div align="center">

| City | Transport Operator | Status | Routes |
|------|-------------------|--------|--------|
| 🏙️ **Bangalore** | BMTC, KSRTC | ✅ Active | 500+ |
| 🏛️ **Delhi** | DTC, Cluster | ✅ Active | 800+ |
| 🏢 **Mumbai** | BEST, MSRTC | ✅ Active | 600+ |
| 🌊 **Chennai** | MTC, TNSTC | ✅ Active | 450+ |
| 💎 **Hyderabad** | TSRTC | ✅ Active | 400+ |
| 🎓 **Pune** | PMPML | ✅ Active | 300+ |

</div>

---

## 🧪 API Documentation

### REST Endpoints

<details>
<summary><b>Authentication APIs</b></summary>

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/profile
```

</details>

<details>
<summary><b>Bus APIs</b></summary>

```http
GET  /api/buses              # Get all buses
GET  /api/buses/:id          # Get specific bus
GET  /api/buses/search       # Search buses
GET  /api/buses/:id/route    # Get bus route
GET  /api/buses/:id/eta      # Get ETA
```

</details>

<details>
<summary><b>Live Tracking APIs</b></summary>

```http
GET  /api/live/:busId        # Get live location
GET  /api/live/:busId/stops  # Get upcoming stops
POST /api/live/:busId/track  # Start tracking
```

</details>

<details>
<summary><b>WebSocket Events</b></summary>

**Client → Server:**
```javascript
socket.emit('trackBus', { busId: '123' });
socket.emit('stopTracking', { busId: '123' });
```

**Server → Client:**
```javascript
socket.on('busLocation', (data) => { /* Handle location update */ });
socket.on('busArriving', (data) => { /* Handle arrival notification */ });
```

</details>

Full API documentation: [API Docs](docs/API.md)

---

## 🧪 Testing

```bash
# Run frontend tests
npm run test

# Run frontend tests with coverage
npm run test:coverage

# Run backend tests
cd backend
npm run test

# Run E2E tests (if configured)
npm run test:e2e
```

---

## 📦 Building for Production

### Frontend Build

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Output will be in dist/ folder
```

### Backend Deployment

```bash
cd backend

# Set production environment
export NODE_ENV=production

# Start server
npm start
```

### Docker Deployment (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, or documentation improvements.

### How to Contribute

1. **🍴 Fork the Repository**
   ```bash
   # Click the 'Fork' button on GitHub
   ```

2. **🌿 Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **✍️ Make Your Changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests if applicable

4. **✅ Commit Your Changes**
   ```bash
   git commit -m 'feat: Add amazing feature'
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation
   - `style:` Formatting
   - `refactor:` Code restructuring
   - `test:` Tests
   - `chore:` Maintenance

5. **📤 Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **🎉 Open Pull Request**
   - Describe your changes
   - Link related issues
   - Wait for review

### Contribution Guidelines

- **Code Quality:** Maintain consistent style and formatting
- **Testing:** Add tests for new features
- **Documentation:** Update docs for significant changes
- **Commits:** Write clear, descriptive commit messages
- **Issues:** Check existing issues before creating new ones

Read our full [Contributing Guide](docs/CONTRIBUTING.md) for more details.

---

## 🐛 Issues & Support

### 🐛 Bug Reports

Found a bug? Help us fix it!

1. Check [existing issues](https://github.com/your-username/where-is-my-bus-india/issues)
2. [Create new issue](https://github.com/your-username/where-is-my-bus-india/issues/new) with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details

### 💡 Feature Requests

Have an idea? We'd love to hear it!

1. Check [discussions](https://github.com/your-username/where-is-my-bus-india/discussions)
2. Create new discussion with:
   - Clear feature description
   - Use case and benefits
   - Possible implementation approach

### 💬 Questions & Discussions

- **General Questions:** [GitHub Discussions](https://github.com/your-username/where-is-my-bus-india/discussions)
- **Community Chat:** [Join our Discord](https://discord.gg/whereismybus) (if available)
- **Email Support:** support@whereismybus.in

---

## 🎯 Roadmap

### ✅ Completed
- [x] Real-time bus tracking with WebSocket
- [x] AI-powered crowd prediction
- [x] Multi-language support (5 languages)
- [x] Live tracking UI (WhereIsMyTrain style)
- [x] AI Bus Buddy chatbot
- [x] Analytics dashboard
- [x] Dark/Light mode
- [x] Progressive Web App
- [x] Mock/fallback data for demos

### 🚧 In Progress
- [ ] Enhanced ML prediction models
- [ ] Social features (ride sharing)
- [ ] Payment integration (Razorpay)
- [ ] Advanced notifications

### 📋 Planned Features

**Short Term (1-3 months)**
- [ ] 📱 iOS and Android native apps
- [ ] 🗺️ Offline maps support
- [ ] 🎫 Digital ticket booking
- [ ] 📊 Personalized analytics dashboard
- [ ] 🔔 Smart notification preferences
- [ ] 👥 User ratings and reviews

**Medium Term (3-6 months)**
- [ ] 🚁 Traffic helicopter view
- [ ] 🤝 Carpooling integration
- [ ] 🏆 Gamification & achievements
- [ ] 🌦️ Advanced weather impact analysis
- [ ] 📍 AR-based stop finder
- [ ] 💬 Community features

**Long Term (6-12 months)**
- [ ] 🌏 Expand to 20+ cities
- [ ] 🏙️ Smart city integrations
- [ ] 🎟️ Multi-modal transport pass
- [ ] 📈 Predictive maintenance for buses
- [ ] 🔌 EV charging station integration
- [ ] 🤖 Advanced AI route optimization

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

```
✅ Commercial use      ✅ Modification
✅ Distribution        ✅ Private use
⚠️ Liability          ⚠️ Warranty
```

---

## 🙏 Acknowledgments

Special thanks to:

- **[Google Maps Platform](https://developers.google.com/maps)** - For mapping and geolocation services
- **[Firebase](https://firebase.google.com/)** - For backend infrastructure and authentication
- **[React Team](https://react.dev/)** - For the amazing UI library
- **[Socket.IO](https://socket.io/)** - For real-time communication
- **[Tailwind CSS](https://tailwindcss.com/)** - For beautiful styling utilities
- **[WhereIsMyTrain](https://wherismytrain.in/)** - For UI/UX inspiration
- **Open Source Community** - For countless libraries and tools
- **Our Contributors** - For making this project better

### Built With ❤️ By

- **Project Lead:** [Your Name](https://github.com/yourusername)
- **Contributors:** [All Contributors](https://github.com/your-username/where-is-my-bus-india/graphs/contributors)

---

## 📞 Contact & Support

<div align="center">

### Get in Touch

[![Email](https://img.shields.io/badge/Email-support@whereismybus.in-red?style=flat&logo=gmail)](mailto:support@whereismybus.in)
[![GitHub](https://img.shields.io/badge/GitHub-your--username-181717?style=flat&logo=github)](https://github.com/your-username)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/your-profile)
[![Twitter](https://img.shields.io/badge/Twitter-@whereismybus-1DA1F2?style=flat&logo=twitter)](https://twitter.com/whereismybus)

</div>

### 💬 Support Channels

- **📧 Email:** support@whereismybus.in
- **🐛 Issues:** [GitHub Issues](https://github.com/your-username/where-is-my-bus-india/issues)
- **💬 Discussions:** [GitHub Discussions](https://github.com/your-username/where-is-my-bus-india/discussions)
- **📖 Documentation:** [Project Docs](docs/)

---

## 🌟 Show Your Support

If you find this project useful, please consider:

- ⭐ **Star this repository** on GitHub
- 🐛 **Report bugs** or **suggest features**
- 🤝 **Contribute** to the codebase
- 📢 **Share** with others who might benefit
- 💰 **Sponsor** the project (if you'd like)

---

## 📊 Project Stats

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/your-username/where-is-my-bus-india?style=social)
![GitHub forks](https://img.shields.io/github/forks/your-username/where-is-my-bus-india?style=social)
![GitHub issues](https://img.shields.io/github/issues/your-username/where-is-my-bus-india)
![GitHub pull requests](https://img.shields.io/github/issues-pr/your-username/where-is-my-bus-india)
![GitHub last commit](https://img.shields.io/github/last-commit/your-username/where-is-my-bus-india)

</div>

---

<div align="center">

### 🚌 Made with ❤️ for Better Public Transportation

**Transforming how India travels, one bus at a time**

⭐ **Star us on GitHub** • 🐛 **Report Issues** • 🤝 **Contribute**

[🌐 Website](https://whereismybus.in) • [📖 Docs](docs/) • [💬 Community](https://github.com/your-username/where-is-my-bus-india/discussions)

---

**© 2024-2025 Where Is My Bus - Final Year Project**

</div>

