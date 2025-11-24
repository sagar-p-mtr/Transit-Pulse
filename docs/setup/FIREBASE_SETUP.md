# Firebase Backend Setup Guide

Your backend is now configured to use Firebase Firestore instead of SQLite! 🎉

## Current Configuration

The backend now uses a **database adapter** that automatically switches between Firebase and SQLite based on the `USE_FIREBASE` environment variable.

### Files Modified:
1. ✅ `/backend/src/config/database-adapter.js` - Main database adapter
2. ✅ `/backend/src/app.js` - Updated to use database adapter
3. ✅ `/backend/src/routes/buses.js` - Updated to use database adapter
4. ✅ `/backend/src/routes/liveTracking.js` - Updated to use database adapter
5. ✅ `/backend/src/services/gpsSimulator.js` - Updated to use database adapter
6. ✅ `/backend/src/services/iotService.js` - Updated to use database adapter
7. ✅ `/backend/.env` - Added `USE_FIREBASE=true`

## How It Works

The database adapter (`database-adapter.js`) provides a unified query interface that:
- Parses SQL queries
- Translates them to Firebase Firestore operations
- Returns data in the same format as SQLite

This means **no changes required** to your existing SQL queries!

## Environment Variables

Make sure your `.env` file has:

```env
USE_FIREBASE=true
FIREBASE_PROJECT_ID=whereismybus-5df3c
```

## Firebase Collections Structure

Your Firebase Firestore should have these collections:

### `buses` Collection
```javascript
{
  id: "bus_id",
  bus_number: "KA01-1234",
  route_id: "route_id",
  current_lat: 12.9716,
  current_lng: 77.5946,
  speed: 35,
  heading: 180,
  crowd_level: "Medium",
  crowd_percentage: 60,
  is_active: true,
  current_stop_index: 5,
  eta_to_next_stop: 5,
  last_updated: Timestamp,
  created_at: Timestamp
}
```

### `routes` Collection
```javascript
{
  id: "route_id",
  route_number: "335E",
  route_name: "Silk Board to Electronic City",
  source: "Silk Board",
  destination: "Electronic City",
  city: "Bangalore",
  stops: [
    {
      name: "Silk Board",
      latitude: 12.9165,
      longitude: 77.6221
    },
    // ... more stops
  ],
  total_distance: 15.5,
  estimated_time: 45,
  is_active: true,
  created_at: Timestamp
}
```

### `stops` Collection
```javascript
{
  id: "stop_id",
  stop_name: "Silk Board Junction",
  address: "Silk Board, Bangalore",
  latitude: 12.9165,
  longitude: 77.6221,
  routes: ["335E", "500K"], // Array of route numbers
  facilities: ["Bus Shelter", "Seating", "CCTV"],
  created_at: Timestamp
}
```

## Testing

### 1. Start the Backend
```bash
cd backend
npm start
```

You should see:
```
✅ Using Firebase as database backend
✅ Firebase Admin SDK initialized successfully
🚀 Server: http://localhost:5000
```

### 2. Test API Endpoints

#### Get All Buses
```bash
curl http://localhost:5000/api/buses
```

#### Get Live Tracking
```bash
curl http://localhost:5000/api/live-tracking/1/live
```

#### Get Routes
```bash
curl http://localhost:5000/api/buses/routes/all
```

## Populating Firebase Data

You'll need to add some initial data to your Firebase collections. You can:

1. **Use Firebase Console** - Manually add documents through the Firebase web interface
2. **Create a seed script** - Write a Node.js script to populate data
3. **Import from JSON** - Use Firebase CLI to import data

### Example Seed Script

Create `backend/scripts/seed-firebase.js`:

```javascript
const admin = require('firebase-admin');

// Initialize Firebase
admin.initializeApp({
  projectId: 'whereismybus-5df3c'
});

const db = admin.firestore();

async function seedData() {
  // Add sample buses
  const busRef = await db.collection('buses').add({
    bus_number: 'KA01-1234',
    route_id: 'route1',
    current_lat: 12.9716,
    current_lng: 77.5946,
    speed: 35,
    heading: 180,
    crowd_level: 'Medium',
    crowd_percentage: 60,
    is_active: true,
    current_stop_index: 0,
    eta_to_next_stop: 5,
    last_updated: admin.firestore.FieldValue.serverTimestamp(),
    created_at: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log('✅ Added bus:', busRef.id);

  // Add sample route
  const routeRef = await db.collection('routes').add({
    route_number: '335E',
    route_name: 'Silk Board to Electronic City',
    source: 'Silk Board',
    destination: 'Electronic City',
    city: 'Bangalore',
    stops: [
      { name: 'Silk Board', latitude: 12.9165, longitude: 77.6221 },
      { name: 'BTM Layout', latitude: 12.9173, longitude: 77.6109 },
      { name: 'Electronic City', latitude: 12.8456, longitude: 77.6603 }
    ],
    total_distance: 15.5,
    estimated_time: 45,
    is_active: true,
    created_at: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log('✅ Added route:', routeRef.id);
}

seedData().then(() => {
  console.log('✅ Seed data completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Seed data failed:', error);
  process.exit(1);
});
```

Run it:
```bash
node backend/scripts/seed-firebase.js
```

## Switching Back to SQLite

If you need to switch back to SQLite, simply update `.env`:

```env
USE_FIREBASE=false
```

The database adapter will automatically use SQLite instead.

## Troubleshooting

### "Firebase not configured" Warning
- Make sure `FIREBASE_PROJECT_ID` is set in `.env`
- Ensure Firebase Admin SDK is properly initialized
- Check Firebase console for project ID

### No Data Returned
- Firebase collections might be empty
- Run the seed script to populate data
- Check Firebase security rules (in development, set to allow all reads/writes)

### Authentication Errors
- For local development, Firebase Admin SDK uses Application Default Credentials
- Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable if needed
- Or use a service account key file

## Firebase Security Rules

For development, use permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

For production, implement proper security rules!

## Live Tracking with Firebase

The live tracking feature uses:
1. **REST API** - Initial data fetch from Firebase
2. **WebSocket** - Real-time position updates
3. **Firebase Realtime Updates** - Can be enhanced with Firestore listeners

The WebSocket handler simulates bus movement, which can be replaced with actual GPS tracker data.

## Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify Firebase project ID is correct
3. Ensure Firebase collections exist
4. Check environment variables are set correctly

Happy coding! 🚀
