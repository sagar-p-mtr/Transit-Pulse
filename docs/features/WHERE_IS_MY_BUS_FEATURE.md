# 🚌 "Where is My Bus?" Feature - Implementation Guide

## Overview

This feature allows users to track buses in real-time by entering a bus number, similar to "Where is My Train" app. Users can search for a bus by its number and see:
- Current location on a live map
- Which station/stop the bus is currently at
- Route information
- Upcoming stops with ETAs
- Real-time updates via WebSocket

## Features Implemented

### ✅ Backend API Endpoints

1. **Search Bus by Number**
   - **Endpoint**: `GET /api/buses/search/:busNumber`
   - **Description**: Search for buses by bus number (partial match supported)
   - **Returns**: Array of matching buses with route info

2. **Get Current Stop**
   - **Endpoint**: `GET /api/buses/:busId/current-stop`
   - **Description**: Get the nearest stop/station where the bus is currently located
   - **Returns**: Current stop info, distance, and status (At Station/Approaching Station/In Transit)

3. **Get Upcoming Stops**
   - **Endpoint**: `GET /api/buses/:busId/upcoming-stops`
   - **Description**: Get the next 5 upcoming stops with estimated arrival times
   - **Returns**: List of upcoming stops with ETAs calculated based on current speed

### ✅ Frontend Components

1. **BusTracker Component** (`src/components/BusTracker.tsx`)
   - Search input for bus number
   - Display search results
   - Real-time bus tracking interface showing:
     - Current location and status
     - Route information
     - Speed and crowd level
     - Current stop/station
     - Upcoming stops with ETAs
     - Live map integration

2. **Integration with LiveTrackingSection**
   - Added new "Where is My Bus?" tab to the tracking section
   - Accessible from the main navigation

### ✅ Real-time Updates

- WebSocket integration for live location updates
- Automatic refresh every 10 seconds
- Subscribes to bus-specific updates when tracking

## How to Use

1. **Navigate to Tracking Section**
   - Click on "Tracking" in the navigation menu
   - Select the "Where is My Bus?" tab (new bus icon)

2. **Search for a Bus**
   - Enter the bus number (e.g., "KA-01-AB-1234" or just "1234")
   - Click "Search" or press Enter
   - Select from the search results if multiple buses found

3. **Track the Bus**
   - Once selected, the bus location is displayed on the map
   - View current stop/station
   - See upcoming stops with estimated arrival times
   - Real-time updates every 10 seconds

## Example Bus Numbers

Based on the sample data in the database:
- `KA-01-AB-1234` - Route: Kengeri to Whitefield (335E)
- `KA-01-CD-5678` - Route: Shivajinagar to Electronic City (500C)
- `KA-01-EF-9012` - Route: Yeswanthpur to KR Market (G4)

## Technical Details

### Database Requirements

The feature uses the existing database schema:
- `buses` table: Contains bus_number, current_lat, current_lng, speed, etc.
- `routes` table: Contains route information and stops (JSONB)
- `bus_stops` table: Contains stop locations (fallback if route stops not available)

### API Response Examples

**Search Bus:**
```json
{
  "success": true,
  "data": [
    {
      "id": "KA01-1234",
      "bus_number": "KA-01-AB-1234",
      "route_name": "Kengeri to Whitefield",
      "current_lat": 12.9716,
      "current_lng": 77.5946,
      "speed": 25.5,
      "crowd_level": "Medium",
      "crowd_percentage": 50
    }
  ]
}
```

**Current Stop:**
```json
{
  "success": true,
  "data": {
    "bus": {...},
    "currentStop": {
      "name": "Kengeri Bus Stand",
      "distance": 45,
      "isAtStop": true
    },
    "status": "At Station"
  }
}
```

**Upcoming Stops:**
```json
{
  "success": true,
  "data": {
    "bus": {...},
    "currentStop": "Kengeri Bus Stand",
    "upcomingStops": [
      {
        "name": "Next Stop",
        "distance": 500,
        "eta": 2,
        "etaFormatted": "2 min"
      }
    ]
  }
}
```

## Future Enhancements

Potential improvements:
1. Add direction indicator (towards destination)
2. Show bus history/path traveled
3. Add notifications for bus arrival at specific stops
4. Support for favorite buses
5. Integration with bus schedules
6. Estimated time to destination

## Testing

To test the feature:
1. Ensure backend is running and database is populated
2. Start the frontend application
3. Navigate to Tracking → "Where is My Bus?" tab
4. Try searching with bus numbers like "KA-01-AB-1234" or "1234"
5. Verify real-time updates work (if GPS simulator is running)

## Notes

- The feature uses GPS simulator data if available
- Current stop detection uses distance calculation (within 500m considered "near", within 50m considered "at stop")
- ETA calculation is based on current speed (defaults to 30 km/h if speed is 0)
- The map component is integrated but may need the route_id for full functionality

