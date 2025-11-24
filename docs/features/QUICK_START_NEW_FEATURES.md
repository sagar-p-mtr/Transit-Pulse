# 🚀 Quick Start Guide - New Features

## ⚡ 5-Minute Setup

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Run database migration for new features
psql -U postgres -d whereismybus -f database/new_features_schema.sql

# Start backend server
npm run dev
```

**Backend should now be running on `http://localhost:5000`** ✅

### 2. Frontend Setup

```bash
# Navigate to project root
cd ..

# Create .env file if not exists
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start frontend
npm run dev
```

**Frontend should now be running on `http://localhost:5173`** ✅

### 3. Test the Features

#### Test Bus Buddy AI 🧠
1. Open app at `http://localhost:5173`
2. Click **🧠 button** (bottom-left)
3. Go to **Settings tab**
4. Configure your preferences
5. Record some trips to see patterns!

#### Test Weather Routes 🌦️
1. Click **🌦️ button** (bottom-left)
2. View **Current Weather** for Bangalore
3. Check **Forecast** for next 24 hours
4. View **Flood Alerts**

#### Test Crowd Prediction 🔮
1. Click **🔮 button** (bottom-left)
2. See **Current** crowd prediction
3. View **Forecast** for next 3 hours
4. Check **Trends** for past 7 days

---

## 🎯 Feature Buttons Location

**Bottom-Left Corner** (New Features):
- 🧠 Purple-Pink: **Bus Buddy AI**
- 🌦️ Blue-Cyan: **Weather-Aware Routes**  
- 🔮 Indigo-Purple: **Crowd Prediction**

**Bottom-Right Corner** (Existing Features):
- 💬 Purple-Blue: **AI Assistant (BusGuru)**
- 🎮 Blue-Cyan: **3D Bus View**
- 👥 Pink-Rose: **Social Features**
- 📹 Indigo-Purple: **AR Navigation**
- 💰 Green: **Fare Calculator**

---

## 📝 Environment Variables

### Backend `.env`
```env
# Required
DATABASE_URL=postgresql://postgres:password@localhost:5432/whereismybus
FRONTEND_URL=http://localhost:5173
PORT=5000
NODE_ENV=development

# Optional (uses mock data if not provided)
OPENWEATHER_API_KEY=your_api_key_here
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔧 Troubleshooting

### Backend won't start?
```bash
# Check if PostgreSQL is running
pg_isready

# Check if port 5000 is available
lsof -i :5000
```

### Database errors?
```bash
# Drop and recreate database (if needed)
dropdb whereismybus
createdb whereismybus

# Run original schema first
psql -U postgres -d whereismybus -f backend/database/schema.sql

# Then run new features schema
psql -U postgres -d whereismybus -f backend/database/new_features_schema.sql
```

### Frontend errors?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
```

---

## 🎨 What You'll See

### Bus Buddy AI
- **Suggestions Tab**: AI-generated commute suggestions with confidence scores
- **Patterns Tab**: Your learned commute patterns (route, time, frequency)
- **Settings Tab**: Preferences and customization options

### Weather-Aware Routes
- **Current Tab**: Live weather with temperature, humidity, wind, rain
- **Forecast Tab**: 24-hour weather forecast in 3-hour intervals
- **Routes Tab**: Weather-based route recommendations
- **Alerts Tab**: Community flood reports with upvoting

### Crowd Prediction
- **Current Tab**: Real-time crowd prediction with AI insights
- **Forecast Tab**: Next 3 hours crowd levels in 30-min intervals
- **Trends Tab**: 7-day historical patterns with visual charts

---

## 🎉 You're All Set!

All three features are now fully functional and integrated into your app!

**Next Steps:**
1. Read `NEW_FEATURES_README.md` for detailed documentation
2. Test each feature thoroughly
3. Add sample data for better demos
4. Customize UI colors/branding if needed

**Happy Testing! 🚀**

