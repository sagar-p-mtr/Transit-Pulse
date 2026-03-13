-- SQLite Database Schema for Transit Pulse

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone_number TEXT UNIQUE NOT NULL,
    email TEXT,
    name TEXT,
    wallet_balance REAL DEFAULT 0.00,
    fcm_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
    id TEXT PRIMARY KEY,
    route_name TEXT NOT NULL,
    route_number TEXT NOT NULL,
    city TEXT NOT NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    via TEXT,
    frequency TEXT,
    stops TEXT, -- JSON stored as TEXT in SQLite
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bus stops table
CREATE TABLE IF NOT EXISTS bus_stops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    city TEXT NOT NULL,
    amenities TEXT, -- JSON stored as TEXT in SQLite
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Buses table
CREATE TABLE IF NOT EXISTS buses (
    id TEXT PRIMARY KEY,
    bus_number TEXT NOT NULL,
    route_id TEXT REFERENCES routes(id),
    current_lat REAL,
    current_lng REAL,
    speed REAL DEFAULT 0,
    crowd_level TEXT CHECK (crowd_level IN ('Low', 'Medium', 'High')),
    crowd_percentage INTEGER CHECK (crowd_percentage >= 0 AND crowd_percentage <= 100),
    is_active INTEGER DEFAULT 1,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update last_updated timestamp
CREATE TRIGGER IF NOT EXISTS bus_timestamp_trigger
AFTER UPDATE OF current_lat, current_lng, speed, crowd_level, crowd_percentage ON buses
BEGIN
    UPDATE buses SET last_updated = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Bus history (for ML training)
CREATE TABLE IF NOT EXISTS bus_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bus_id TEXT REFERENCES buses(id),
    route_id TEXT REFERENCES routes(id),
    stop_id TEXT,
    latitude REAL,
    longitude REAL,
    speed REAL,
    crowd_percentage INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ML Training Data
CREATE TABLE IF NOT EXISTS ml_training_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bus_id TEXT REFERENCES buses(id),
    route_id TEXT REFERENCES routes(id),
    stop_id TEXT,
    latitude REAL,
    longitude REAL,
    speed REAL,
    distance_to_stop REAL,
    traffic_level INTEGER CHECK (traffic_level >= 1 AND traffic_level <= 3),
    weather_condition TEXT,
    temperature REAL,
    hour INTEGER CHECK (hour >= 0 AND hour < 24),
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week < 7),
    is_weekend INTEGER DEFAULT 0,
    is_holiday INTEGER DEFAULT 0,
    actual_arrival_time DATETIME,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data TEXT, -- JSON stored as TEXT
    status TEXT CHECK (status IN ('sent', 'read', 'failed')) DEFAULT 'sent',
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Community reports table
CREATE TABLE IF NOT EXISTS community_reports (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    type TEXT CHECK (type IN ('delay', 'crowded', 'accident', 'breakdown', 'traffic')) NOT NULL,
    route_id TEXT REFERENCES routes(id),
    bus_id TEXT REFERENCES buses(id),
    description TEXT,
    latitude REAL,
    longitude REAL,
    upvotes INTEGER DEFAULT 0,
    verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bus ratings table
CREATE TABLE IF NOT EXISTS bus_ratings (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    bus_id TEXT REFERENCES buses(id),
    route_id TEXT REFERENCES routes(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    cleanliness INTEGER CHECK (cleanliness >= 1 AND cleanliness <= 5),
    driver_behavior INTEGER CHECK (driver_behavior >= 1 AND driver_behavior <= 5),
    comfort INTEGER CHECK (comfort >= 1 AND comfort <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bus_history_timestamp ON bus_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_bus_history_route ON bus_history(route_id);
CREATE INDEX IF NOT EXISTS idx_ml_data_route_stop ON ml_training_data(route_id, stop_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created ON community_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_buses_route ON buses(route_id);
CREATE INDEX IF NOT EXISTS idx_buses_active ON buses(is_active);

-- Insert sample data
INSERT OR IGNORE INTO routes (id, route_name, route_number, city, source, destination) VALUES
('bmtc-335E', 'Kengeri to Whitefield', '335E', 'Bangalore', 'Kengeri', 'Whitefield'),
('bmtc-500C', 'Shivajinagar to Electronic City', '500C', 'Bangalore', 'Shivajinagar', 'Electronic City'),
('bmtc-G4', 'Yeswanthpur to KR Market', 'G4', 'Bangalore', 'Yeswanthpur', 'KR Market');

INSERT OR IGNORE INTO buses (id, bus_number, route_id, current_lat, current_lng, speed, crowd_level, crowd_percentage, is_active) VALUES
('KA01-1234', 'KA-01-AB-1234', 'bmtc-335E', 12.9716, 77.5946, 25.5, 'Medium', 50, 1),
('KA01-5678', 'KA-01-CD-5678', 'bmtc-500C', 12.9789, 77.5917, 30.2, 'Low', 30, 1),
('KA01-9012', 'KA-01-EF-9012', 'bmtc-G4', 12.9853, 77.5892, 20.8, 'High', 85, 1);

