-- Enable PostGIS extension (optional - skip if not installed)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(10) UNIQUE NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    fcm_token TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
    id VARCHAR(50) PRIMARY KEY,
    route_name VARCHAR(255) NOT NULL,
    route_number VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    via TEXT,
    frequency VARCHAR(50),
    stops JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bus stops table (simplified - no PostGIS required)
CREATE TABLE IF NOT EXISTS bus_stops (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    city VARCHAR(100) NOT NULL,
    amenities JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Buses table (simplified - no PostGIS required)
CREATE TABLE IF NOT EXISTS buses (
    id VARCHAR(50) PRIMARY KEY,
    bus_number VARCHAR(50) NOT NULL,
    route_id VARCHAR(50) REFERENCES routes(id),
    current_lat DECIMAL(10, 7),
    current_lng DECIMAL(10, 7),
    speed DECIMAL(5,2) DEFAULT 0,
    crowd_level VARCHAR(20) CHECK (crowd_level IN ('Low', 'Medium', 'High')),
    crowd_percentage INT CHECK (crowd_percentage >= 0 AND crowd_percentage <= 100),
    is_active BOOLEAN DEFAULT true,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Trigger to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_bus_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bus_timestamp_trigger ON buses;
CREATE TRIGGER bus_timestamp_trigger
BEFORE UPDATE ON buses
FOR EACH ROW
EXECUTE FUNCTION update_bus_timestamp();

-- Bus history (for ML training)
CREATE TABLE IF NOT EXISTS bus_history (
    id BIGSERIAL PRIMARY KEY,
    bus_id VARCHAR(50) REFERENCES buses(id),
    route_id VARCHAR(50) REFERENCES routes(id),
    stop_id VARCHAR(50),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    speed DECIMAL(5,2),
    crowd_percentage INT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- ML Training Data
CREATE TABLE IF NOT EXISTS ml_training_data (
    id BIGSERIAL PRIMARY KEY,
    bus_id VARCHAR(50) REFERENCES buses(id),
    route_id VARCHAR(50) REFERENCES routes(id),
    stop_id VARCHAR(50),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    speed DECIMAL(5,2),
    distance_to_stop DECIMAL(10,3),
    traffic_level INT CHECK (traffic_level >= 1 AND traffic_level <= 3),
    weather_condition VARCHAR(50),
    temperature DECIMAL(5,2),
    hour INT CHECK (hour >= 0 AND hour < 24),
    day_of_week INT CHECK (day_of_week >= 0 AND day_of_week < 7),
    is_weekend BOOLEAN,
    is_holiday BOOLEAN,
    actual_arrival_time TIMESTAMP,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    status VARCHAR(20) CHECK (status IN ('sent', 'read', 'failed')) DEFAULT 'sent',
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Community reports table (simplified - no PostGIS required)
CREATE TABLE IF NOT EXISTS community_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) CHECK (type IN ('delay', 'crowded', 'accident', 'breakdown', 'traffic')) NOT NULL,
    route_id VARCHAR(50) REFERENCES routes(id),
    bus_id VARCHAR(50) REFERENCES buses(id),
    description TEXT,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    upvotes INT DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bus ratings table
CREATE TABLE IF NOT EXISTS bus_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    bus_id VARCHAR(50) REFERENCES buses(id),
    route_id VARCHAR(50) REFERENCES routes(id),
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    cleanliness INT CHECK (cleanliness >= 1 AND cleanliness <= 5),
    driver_behavior INT CHECK (driver_behavior >= 1 AND driver_behavior <= 5),
    comfort INT CHECK (comfort >= 1 AND comfort <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bus_history_timestamp ON bus_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_bus_history_route ON bus_history(route_id);
CREATE INDEX IF NOT EXISTS idx_ml_data_route_stop ON ml_training_data(route_id, stop_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created ON community_reports(created_at);

-- Insert sample data
INSERT INTO routes (id, route_name, route_number, city, source, destination) VALUES
('bmtc-335E', 'Kengeri to Whitefield', '335E', 'Bangalore', 'Kengeri', 'Whitefield'),
('bmtc-500C', 'Shivajinagar to Electronic City', '500C', 'Bangalore', 'Shivajinagar', 'Electronic City'),
('bmtc-G4', 'Yeswanthpur to KR Market', 'G4', 'Bangalore', 'Yeswanthpur', 'KR Market')
ON CONFLICT (id) DO NOTHING;

INSERT INTO buses (id, bus_number, route_id, current_lat, current_lng, speed, crowd_level, crowd_percentage, is_active) VALUES
('KA01-1234', 'KA-01-AB-1234', 'bmtc-335E', 12.9716, 77.5946, 25.5, 'Medium', 50, true),
('KA01-5678', 'KA-01-CD-5678', 'bmtc-500C', 12.9789, 77.5917, 30.2, 'Low', 30, true),
('KA01-9012', 'KA-01-EF-9012', 'bmtc-G4', 12.9853, 77.5892, 20.8, 'High', 85, true)
ON CONFLICT (id) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '✅ Sample data inserted!';
END $$;

