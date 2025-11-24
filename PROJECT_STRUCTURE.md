# 📁 Project Structure

This document describes the complete structure of the **Where Is My Bus** project.

---

## 🗂️ Root Directory Structure

```
project/
├── 📂 .bolt/                  # Bolt configuration
├── 📂 archive/                # Archived & legacy files
│   ├── ADVANCED.zip           # Advanced features archive
│   └── SEAT-VACANCY-APPROACHES/ # Legacy seat vacancy code
│
├── 📂 backend/                # Backend server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   ├── database.js            # SQLite database config
│   │   │   ├── database-adapter.js    # Unified DB adapter (Firebase/SQLite)
│   │   │   ├── firebase.js            # Firebase configuration
│   │   │   └── redis.js               # Redis cache config
│   │   ├── routes/            # API route handlers
│   │   │   ├── buses.js               # Bus routes API
│   │   │   ├── liveTracking.js        # Live tracking API (NEW!)
│   │   │   ├── auth.js                # Authentication
│   │   │   ├── busBuddy.js            # AI assistant
│   │   │   ├── crowdPrediction.js     # Crowd analytics
│   │   │   ├── ml.js                  # ML predictions
│   │   │   ├── notifications.js       # Push notifications
│   │   │   ├── social.js              # Social features
│   │   │   └── weather.js             # Weather data
│   │   ├── services/          # Business logic
│   │   │   ├── gpsSimulator.js        # GPS data simulation
│   │   │   ├── iotService.js          # IoT device communication
│   │   │   ├── aiEnhancedBusBuddy.js  # AI chat service
│   │   │   ├── busBuddyService.js     # Bus buddy logic
│   │   │   ├── crowdPredictionService.js
│   │   │   ├── notificationService.js
│   │   │   └── weatherService.js
│   │   └── websocket/         # WebSocket handlers
│   │       ├── socketHandler.js       # Main socket handler
│   │       └── liveTrackingHandler.js # Live tracking (NEW!)
│   ├── database/              # Database schemas
│   ├── data/                  # SQLite database files
│   ├── scripts/               # Utility scripts
│   ├── .env                   # Environment variables
│   ├── package.json           # Backend dependencies
│   └── README.md              # Backend documentation
│
├── 📂 dist/                   # Production build output
│
├── 📂 docs/                   # All documentation (ORGANIZED!)
│   ├── 📂 setup/              # Setup & installation guides
│   │   ├── FIREBASE_SETUP.md
│   │   ├── BACKEND_SETUP_INSTRUCTIONS.md
│   │   └── SETUP_WITHOUT_DOCKER.md
│   ├── 📂 guides/             # How-to guides
│   │   ├── QUICK_START_GUIDE.md
│   │   ├── AI_POWERED_BUS_BUDDY_GUIDE.md
│   │   ├── MULTI_CITY_GUIDE.md
│   │   ├── ERROR_FIX_GUIDE.md
│   │   ├── IMPLEMENTATION_COMPLETE.md
│   │   ├── MIGRATION_COMPLETE.md
│   │   ├── TESTING-REPORT.md
│   │   └── ... (all other guides)
│   ├── 📂 features/           # Feature documentation
│   │   ├── WHERE_IS_MY_BUS_FEATURE.md
│   │   ├── FEATURES_VISUAL_GUIDE.md
│   │   └── NEW_FEATURES_README.md
│   ├── 📂 architecture/       # Architecture docs
│   │   ├── BACKEND_ARCHITECTURE_PROPOSAL.md
│   │   ├── BACKEND_STARTER_CODE.md
│   │   └── BACKEND_FIXES_SUMMARY.md
│   ├── 📂 diagrams/           # UML & PlantUML diagrams
│   │   ├── system-architecture.puml
│   │   ├── deployment-architecture.puml
│   │   ├── component-interaction.puml
│   │   ├── data-flow-diagram.puml
│   │   └── ... (all .puml files)
│   ├── INDEX.md               # Documentation index
│   └── Paper-Template-Format.docx
│
├── 📂 node_modules/           # Frontend dependencies (not in git)
│
├── 📂 public/                 # Static assets
│   ├── images/
│   ├── icons/
│   └── index.html
│
├── 📂 scripts/                # Build & utility scripts
│   └── cleanup-database.js    # Database cleanup utility
│
├── 📂 src/                    # Frontend source code
│   ├── 📂 components/         # React components
│   │   ├── LiveBusTracker.tsx         # Live tracking UI (NEW!)
│   │   ├── LiveTrackingSection.tsx    # Tracking section
│   │   ├── RouteDetailsModal.tsx      # Route details with tracking
│   │   ├── BusRouteMap.tsx            # Map component
│   │   ├── BusTracker.tsx             # Bus tracker
│   │   ├── BusBuddyAI.tsx             # AI chatbot
│   │   ├── CrowdDetectionInfo.tsx     # Crowd info
│   │   ├── HeroSection.tsx            # Landing page hero
│   │   ├── SearchSection.tsx          # Search interface
│   │   ├── ai/                        # AI components
│   │   ├── ar/                        # AR features
│   │   ├── social/                    # Social features
│   │   └── visualization/             # 3D visualizations
│   ├── 📂 contexts/           # React contexts
│   │   ├── CityContext.tsx            # Multi-city context
│   │   └── ThemeContext.tsx           # Theme context
│   ├── 📂 hooks/              # Custom React hooks
│   │   ├── useFirebase.ts             # Firebase hook
│   │   ├── useOfflineData.ts          # Offline support
│   │   └── useRealtimeUpdates.ts      # WebSocket hook
│   ├── 📂 i18n/               # Internationalization
│   │   └── locales/                   # Translation files
│   │       ├── en.json                # English
│   │       ├── hi.json                # Hindi
│   │       ├── ta.json                # Tamil
│   │       ├── te.json                # Telugu
│   │       └── kn.json                # Kannada
│   ├── 📂 services/           # API services
│   │   ├── api.ts                     # Main API client
│   │   ├── backendApi.ts              # Backend API
│   │   ├── firebaseService.ts         # Firebase service
│   │   ├── realtimeService.ts         # WebSocket service
│   │   ├── aiService.ts               # AI services
│   │   └── ... (other services)
│   ├── 📂 utils/              # Utility functions
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
│
├── 📂 union/                  # Legacy union templates
│
├── 📄 .env                    # Frontend environment variables
├── 📄 .gitignore              # Git ignore rules
├── 📄 eslint.config.js        # ESLint configuration
├── 📄 index.html              # HTML entry point
├── 📄 package.json            # Frontend dependencies
├── 📄 package-lock.json       # Dependency lock file
├── 📄 postcss.config.js       # PostCSS configuration
├── 📄 tailwind.config.js      # Tailwind CSS config
├── 📄 tsconfig.json           # TypeScript config
├── 📄 tsconfig.app.json       # App TypeScript config
├── 📄 tsconfig.node.json      # Node TypeScript config
├── 📄 vite.config.ts          # Vite configuration
├── 📄 PROJECT_STRUCTURE.md    # This file
└── 📄 README.md               # Main project README
```

---

## 🎯 Key Directories Explained

### 📂 `/src` - Frontend Source
The heart of the React application. All UI components, hooks, services, and utilities.

**Important Files:**
- `LiveBusTracker.tsx` - NEW! Beautiful live tracking interface
- `App.tsx` - Main application component
- `main.tsx` - Application entry point

### 📂 `/backend` - Backend Server
Node.js/Express backend with WebSocket support for real-time features.

**Important Files:**
- `src/config/database-adapter.js` - Unified database adapter (Firebase/SQLite)
- `src/routes/liveTracking.js` - NEW! Live tracking API endpoints
- `src/websocket/liveTrackingHandler.js` - NEW! Live tracking WebSocket handler
- `src/app.js` - Main server file

### 📂 `/docs` - Documentation
All documentation organized by category. No more scattered markdown files!

**Structure:**
- `setup/` - Installation and configuration guides
- `guides/` - How-to guides and tutorials
- `features/` - Feature-specific documentation
- `architecture/` - System design and architecture
- `diagrams/` - Visual diagrams (PlantUML)

### 📂 `/scripts` - Utility Scripts
Helpful scripts for database management, seeding, migrations, etc.

### 📂 `/archive` - Archived Files
Old or deprecated code that's kept for reference but not actively used.

---

## 🆕 Recently Added Files

### Live Tracking Feature (NEW!)
- **Frontend:**
  - `src/components/LiveBusTracker.tsx` - Beautiful tracking UI
  
- **Backend:**
  - `backend/src/routes/liveTracking.js` - API endpoints
  - `backend/src/websocket/liveTrackingHandler.js` - WebSocket handler
  - `backend/src/config/database-adapter.js` - Database abstraction

### Documentation
- `docs/INDEX.md` - Central documentation index
- `docs/setup/FIREBASE_SETUP.md` - Firebase configuration guide
- `README.md` - Completely rewritten main README

---

## 📝 Configuration Files

### Environment Variables
- `.env` (root) - Frontend environment variables
- `backend/.env` - Backend environment variables

### Build Configuration
- `vite.config.ts` - Vite bundler configuration
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS plugins
- `eslint.config.js` - Code linting rules

---

## 🔍 Finding Files

### Need to find documentation?
1. Check `docs/INDEX.md` - Complete documentation index
2. Browse `docs/` subdirectories by category
3. Use search: All docs are in Markdown format

### Need to find a component?
- All React components: `src/components/`
- API services: `src/services/`
- Custom hooks: `src/hooks/`

### Need to find backend code?
- API routes: `backend/src/routes/`
- Business logic: `backend/src/services/`
- Configuration: `backend/src/config/`

---

## 🧹 Clean Project Structure

The project has been organized to follow these principles:

1. **Separation of Concerns** - Code, docs, and config are separate
2. **Logical Grouping** - Related files are grouped together
3. **Clear Naming** - Descriptive names for all folders
4. **No Clutter** - Root directory only has essential files
5. **Easy Navigation** - INDEX.md helps find documentation quickly

---

## 📦 What's in Archive?

The `archive/` folder contains:
- Old implementation approaches
- Deprecated features
- Legacy code kept for reference
- Zip files of old versions

**Note:** Files in `archive/` are not actively maintained.

---

## 🚀 Getting Started with the Structure

1. **Start with README.md** - Project overview and quick start
2. **Check docs/INDEX.md** - Find specific documentation
3. **Explore src/** - Browse frontend code
4. **Explore backend/** - Browse backend code
5. **Read docs/setup/** - Set up your development environment

---

## 🤝 Contributing

When adding new files:
- **Code** → Place in appropriate `/src` or `/backend` folder
- **Documentation** → Add to `/docs` with proper category
- **Scripts** → Add to `/scripts`
- **Tests** → Co-locate with source files or in `__tests__`

---

<div align="center">

**Clean Code, Clean Structure! 🎯**

[Back to Main README](README.md) • [Documentation Index](docs/INDEX.md)

</div>
