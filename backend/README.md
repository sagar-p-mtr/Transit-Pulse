# 🚌 Where Is My Bus - Backend

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start database
docker-compose up -d

# 4. Run migrations (create tables)
npm run migrate

# 5. Start server
npm run dev
```

Server will run on `http://localhost:5000`

## Features

✅ Real-time bus tracking with WebSocket
✅ IoT/MQTT integration for sensors
✅ ML predictions for ETA
✅ Smart notifications
✅ Social/community features
✅ GPS simulator for testing

## API Endpoints

### ML Predictions
- `POST /api/ml/predict-eta` - Predict bus arrival time
- `POST /api/ml/predict-crowd` - Predict crowd level

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/register-token` - Register FCM token

### Social
- `POST /api/social/reports` - Post community report
- `GET /api/social/reports` - Get reports
- `POST /api/social/ratings` - Rate a bus
- `GET /api/social/leaderboard` - Get leaderboard

## Testing

```bash
# Test ML prediction
curl -X POST http://localhost:5000/api/ml/predict-eta \
  -H "Content-Type: application/json" \
  -d '{"busId":"KA01-1234","stopId":"stop-123"}'
```

## Next Steps

1. Create database tables (see `database/schema.sql`)
2. Add authentication routes
3. Add payment integration
4. Deploy to cloud

Done! 🎉

