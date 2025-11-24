# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Where Is My Bus - India** is a multi-city real-time bus tracking application with AI/ML capabilities, AR navigation, social features, and IoT integration. It's a full-stack TypeScript/JavaScript application supporting 6 major Indian cities (Bangalore, Delhi, Mumbai, Chennai, Hyderabad, Pune).

## Commands

### Frontend Development

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Backend Development

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Initialize SQLite database (creates tables with sample data)
npm run init-db

# Start backend server (runs on http://localhost:5000)
npm run dev

# Start backend in production mode
npm run start

# Populate database with sample data
npm run setup-db

# Run tests
npm run test
```

### Database Management

```bash
# Using Docker (PostgreSQL + Redis + MQTT)
cd backend
docker-compose up -d           # Start all services
docker-compose down            # Stop all services
docker-compose restart         # Restart services
docker logs whereismybus-postgres  # View PostgreSQL logs
docker logs whereismybus-redis     # View Redis logs

# Connect to PostgreSQL (if using Docker)
docker exec -it whereismybus-postgres psql -U postgres -d whereismybus

# SQLite (current default)
# Database file: backend/data/whereismybus.db
# No separate server needed - file-based database
```

### Common Development Tasks

```bash
# Test backend health
curl http://localhost:5000/health

# Test ML prediction endpoint
curl -X POST http://localhost:5000/api/ml/predict-eta \
  -H "Content-Type: application/json" \
  -d '{"busId":"KA01-1234","stopId":"stop-123"}'

# Full stack development (run in separate terminals)
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend && npm run dev

# Terminal 3: Docker services (if needed)
cd backend && docker-compose up
```

## Architecture

### High-Level Architecture

This is a **monorepo-style structure** with separate frontend and backend:

- **Frontend**: React 18 + TypeScript + Vite (SPA with PWA capabilities)
- **Backend**: Node.js + Express (REST API + WebSocket)
- **Database**: SQLite (development) or PostgreSQL (production ready)
- **Real-time**: Socket.IO for live bus tracking
- **State Management**: React Context API + Zustand patterns

### Frontend Architecture

**Component Organization** (src/components/):
- `ai/` - AI Assistant components (BusGuru chatbot)
- `ar/` - Augmented Reality navigation components
- `social/` - Community features (reports, ratings, leaderboard)
- `visualization/` - 3D bus visualization components
- `ui/` - Reusable UI components (buttons, modals, etc.)
- `demo/` - Demo mode components

**Key Architectural Patterns**:
- **Context Providers**: `CityContext` (multi-city switching), `ThemeContext` (dark/light mode)
- **Service Layer**: All API calls isolated in `src/services/`
- **Offline-First**: Uses IndexedDB via `offlineStorage.ts` for offline data
- **Multi-API Pattern**: Each city has dedicated API service (bmtcApi.ts, delhiBusApi.ts, etc.) with fallback to mock data
- **Real-time Service**: `realtimeService.ts` manages WebSocket connections
- **Voice Control**: `voiceService.ts` handles voice commands with Web Speech API

**State Management Flow**:
```
User Action → Service Layer → API Call → Context Update → Component Re-render
                            ↓
                      Offline Storage (IndexedDB)
```

### Backend Architecture

**Layered Architecture**:
- **Routes** (`src/routes/`): Express route handlers (auth, buses, ml, notifications, social, busBuddy, weather, crowdPrediction)
- **Services** (`src/services/`): Business logic layer
  - `mlService.js` - ML/AI prediction engine
  - `gpsSimulator.js` - Simulates real-time GPS data for demo
  - `iotService.js` - MQTT-based IoT sensor integration
  - `notificationService.js` - Push notification handler
  - `busBuddyService.js` - AI chatbot backend
  - `weatherService.js` - Weather-aware routing
  - `crowdPredictionService.js` - Crowd level predictions
- **Middleware** (`src/middleware/`): Auth, validation, error handling
- **WebSocket** (`src/websocket/`): Real-time communication handler
- **Config** (`src/config/`): Database and Redis configuration

**Key Backend Patterns**:
- **Real-time GPS Simulation**: `gpsSimulator.js` broadcasts bus locations every 5 seconds via WebSocket
- **IoT Integration**: MQTT broker listens for sensor data (seat occupancy, GPS) and broadcasts to clients
- **ML Predictions**: Uses time-series analysis for ETA and crowd predictions
- **Dual Database Support**: Can use SQLite (default) or PostgreSQL (production)

**Data Flow**:
```
IoT Sensors → MQTT → Backend Service → WebSocket → Frontend
GPS Device → GPS Simulator → WebSocket → Live Map Updates
User Request → REST API → ML Service → Prediction → Response
```

### Multi-City Architecture

**City Provider Pattern** (`src/services/cityProvider.ts`):
- Auto-detects user's city via GPS
- Loads city-specific APIs dynamically
- Each city has unique features (e.g., AC filters for Chennai, metro integration for Delhi)
- Fallback to mock data if real API unavailable

**Supported Cities**:
- Bangalore (BMTC) - Default, most feature-complete
- Delhi (DTC) - Metro integration
- Mumbai (BEST) - Local train connectivity
- Chennai (MTC) - AC bus tracking
- Hyderabad (TSRTC) - HITEC City routes
- Pune (PMPML) - University shuttles

### Advanced Features Architecture

**AI/ML Components**:
- **ETA Prediction**: LSTM-based time series forecasting (consider historical patterns, traffic, weather)
- **Crowd Prediction**: Classification model using past occupancy data
- **Bus Buddy AI**: NLP-based chatbot for natural language queries

**Real-time Features**:
- **WebSocket Channels**: Separate channels for bus updates, route updates, stop updates
- **Subscription Model**: Clients subscribe to specific buses/routes to minimize data transfer
- **GPS Simulation**: Realistic bus movement with route following

**Offline Capabilities**:
- **Progressive Web App (PWA)**: Installable on mobile/desktop
- **Service Worker**: Caches static assets and API responses
- **IndexedDB**: Stores routes, stops, recent searches offline
- **Background Sync**: Syncs data when connection restored

## Development Guidelines

### Working with the Frontend

1. **Adding New Components**: Place in appropriate subfolder under `src/components/`. Use existing UI components from `src/components/ui/`.

2. **API Integration**: Always use the service layer (`src/services/`). Never call APIs directly from components.

3. **Multi-language Support**: All user-facing text should use `useTranslation()` hook. Add translations to `src/i18n/locales/`.

4. **Theme Support**: Components should respect theme using Tailwind's dark mode classes: `dark:bg-gray-900`.

5. **Mobile-First**: Design for mobile first, then scale up. Use responsive utilities: `md:`, `lg:`.

### Working with the Backend

1. **Database**: Currently using SQLite (`backend/data/whereismybus.db`). The codebase supports PostgreSQL but SQLite is default for easier setup.

2. **Adding New Endpoints**: 
   - Create route in `src/routes/`
   - Add business logic to `src/services/`
   - Register route in `src/app.js`

3. **WebSocket Events**: Add new event handlers in `src/websocket/socketHandler.js`. Follow existing naming convention: `subscribe:entity`, `update:entity`.

4. **ML/AI Features**: ML logic goes in `src/services/mlService.js`. Models can be TensorFlow.js or call Python microservices.

5. **IoT Integration**: MQTT topics follow pattern: `buses/{busId}/sensors/{sensorType}`. See `iotService.js`.

### Environment Variables

**Frontend** (.env):
```
VITE_GOOGLE_MAPS_API_KEY=your_key_here
VITE_BACKEND_URL=http://localhost:5000
```

**Backend** (backend/.env):
```
NODE_ENV=development
PORT=5000
DB_PATH=backend/data/whereismybus.db  # SQLite path
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

### Testing Strategy

- No automated tests currently implemented
- Manual testing via API endpoints (see Commands section)
- Frontend: Test in Chrome DevTools mobile view
- Backend: Use curl or Postman for API testing
- WebSocket: Monitor in browser console (socket events logged)

### Code Organization Principles

1. **Separation of Concerns**: UI logic in components, business logic in services, data access in API layer
2. **Mock Data Fallback**: All API services have mock data fallback for offline/demo mode
3. **Error Handling**: Use `errorHandler.ts` service for consistent error handling
4. **Type Safety**: Use TypeScript interfaces for all API responses and component props
5. **Feature Flags**: Demo mode controlled via `DemoBanner` component

## Important Technical Details

### Database Schema Notes

**SQLite vs PostgreSQL**:
- SQLite is file-based, no server required (current default)
- PostgreSQL setup available via Docker (see docker-compose.yml)
- Database wrapper in `backend/src/config/database.js` handles both
- Migration from PostgreSQL to SQLite completed (see SQLITE_MIGRATION_GUIDE.md)

**Key Tables** (created by `npm run init-db`):
- `users` - User accounts, wallet balance
- `buses` - Bus data, current location, occupancy
- `routes` - Route definitions
- `stops` - Bus stop locations
- `notifications` - User notifications
- `community_reports` - Social features data
- `ratings` - Bus ratings

### WebSocket Event Reference

**Client → Server**:
- `subscribe:bus` - Subscribe to specific bus updates
- `subscribe:route` - Subscribe to route updates
- `subscribe:stop` - Subscribe to stop updates
- `unsubscribe` - Unsubscribe from channel

**Server → Client**:
- `bus:location` - Bus location update
- `bus:occupancy` - Seat occupancy update
- `stop:eta` - ETA update for stop
- `route:status` - Route status change
- `notification:new` - New notification

### Known Limitations

- GPS Simulator provides demo data, not real BMTC/DTC/etc. data
- ML models are simplified (not production-trained models)
- Authentication is OTP-based but not connected to real SMS service
- Payment integration (Razorpay) is stubbed
- IoT sensors are simulated, not connected to real hardware

## Documentation References

- `README.md` - Comprehensive feature overview and setup
- `QUICK_START_GUIDE.md` - 30-minute backend setup tutorial
- `BACKEND_ARCHITECTURE_PROPOSAL.md` - Detailed backend design
- `SQLITE_MIGRATION_GUIDE.md` - Database migration details
- `AI_POWERED_BUS_BUDDY_GUIDE.md` - AI chatbot implementation
- `GOOGLE_MAPS_INTEGRATION.md` - Maps API setup
- `MULTI_CITY_GUIDE.md` - Multi-city implementation details

## Project Context

This is a **Final Year Engineering Project** showcasing:
- Full-stack development (React + Node.js)
- Real-time systems (WebSocket, IoT)
- AI/ML integration (predictions, NLP)
- Modern web technologies (PWA, AR)
- Multi-city scalability
- Mobile-first design

The project emphasizes practical implementation over production-readiness. Many features (GPS, IoT, ML) are simulated for demonstration purposes.
