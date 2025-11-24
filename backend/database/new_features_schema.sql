-- ============================================
-- New Features Database Schema
-- Bus Buddy AI, Weather Routes, Crowd Prediction
-- ============================================

-- ============================================
-- 1. BUS BUDDY AI COMMUTE PLANNER
-- ============================================

-- User commute patterns (learns from user behavior)
CREATE TABLE IF NOT EXISTS user_commute_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    route_id VARCHAR(50) REFERENCES routes(id),
    source_stop_id VARCHAR(50),
    destination_stop_id VARCHAR(50),
    typical_departure_time TIME,
    typical_days JSONB, -- ["monday", "tuesday", "wednesday"]
    frequency INT DEFAULT 1, -- How many times this pattern occurred
    average_duration INT, -- In minutes
    last_traveled TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User preferences for commute
CREATE TABLE IF NOT EXISTS user_commute_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    prefer_ac BOOLEAN DEFAULT false,
    prefer_less_crowded BOOLEAN DEFAULT true,
    prefer_faster_route BOOLEAN DEFAULT true,
    max_walking_distance INT DEFAULT 500, -- In meters
    notification_lead_time INT DEFAULT 15, -- In minutes
    auto_suggest_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Smart notifications/suggestions sent to users
CREATE TABLE IF NOT EXISTS commute_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    route_id VARCHAR(50) REFERENCES routes(id),
    suggestion_type VARCHAR(50) CHECK (suggestion_type IN ('leave_now', 'alternate_route', 'delay_alert', 'early_departure', 'weather_alert')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    suggested_departure_time TIMESTAMP,
    alternate_route_id VARCHAR(50),
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    is_sent BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_patterns_user ON user_commute_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_patterns_days ON user_commute_patterns USING gin(typical_days);
CREATE INDEX IF NOT EXISTS idx_commute_suggestions_user ON commute_suggestions(user_id, is_sent);

-- ============================================
-- 2. WEATHER-AWARE ROUTES
-- ============================================

-- Store weather data for cities
CREATE TABLE IF NOT EXISTS weather_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city VARCHAR(100) NOT NULL,
    temperature DECIMAL(5,2), -- In Celsius
    feels_like DECIMAL(5,2),
    condition VARCHAR(50), -- 'Clear', 'Rain', 'Thunderstorm', 'Drizzle', 'Snow', 'Mist'
    description VARCHAR(255),
    humidity INT,
    wind_speed DECIMAL(5,2),
    rain_1h DECIMAL(5,2), -- Rain volume for last 1 hour in mm
    rain_3h DECIMAL(5,2), -- Rain volume for last 3 hours in mm
    visibility INT, -- In meters
    timestamp TIMESTAMP DEFAULT NOW(),
    forecast_time TIMESTAMP, -- For future forecasts
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bus stop facilities (covered/shelter info)
CREATE TABLE IF NOT EXISTS bus_stop_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stop_id VARCHAR(50) UNIQUE NOT NULL,
    has_shelter BOOLEAN DEFAULT false,
    has_seating BOOLEAN DEFAULT false,
    is_covered BOOLEAN DEFAULT false,
    cover_percentage INT CHECK (cover_percentage >= 0 AND cover_percentage <= 100), -- How much area is covered
    has_display BOOLEAN DEFAULT false, -- Digital display board
    has_lighting BOOLEAN DEFAULT false,
    accessibility_rating INT CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Weather-based route recommendations
CREATE TABLE IF NOT EXISTS weather_route_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id VARCHAR(50) REFERENCES routes(id),
    weather_condition VARCHAR(50),
    recommendation_score DECIMAL(3,2), -- 0.00 (avoid) to 1.00 (highly recommended)
    reason TEXT,
    covered_stops_count INT,
    total_stops_count INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Real-time flood/waterlogging reports
CREATE TABLE IF NOT EXISTS flood_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stop_id VARCHAR(50),
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    reported_by UUID REFERENCES users(id),
    description TEXT,
    is_verified BOOLEAN DEFAULT false,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('active', 'resolved', 'false_alarm')) DEFAULT 'active',
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_city_time ON weather_data(city, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_flood_reports_status ON flood_reports(status, created_at DESC);

-- ============================================
-- 3. CROWD PREDICTION ENGINE
-- ============================================

-- Historical crowd data (for ML training)
CREATE TABLE IF NOT EXISTS crowd_history (
    id BIGSERIAL PRIMARY KEY,
    bus_id VARCHAR(50) REFERENCES buses(id),
    route_id VARCHAR(50) REFERENCES routes(id),
    stop_id VARCHAR(50),
    crowd_percentage INT CHECK (crowd_percentage >= 0 AND crowd_percentage <= 100),
    actual_occupancy INT, -- Number of passengers
    bus_capacity INT, -- Total capacity
    hour INT CHECK (hour >= 0 AND hour < 24),
    day_of_week INT CHECK (day_of_week >= 0 AND day_of_week < 7), -- 0=Sunday, 6=Saturday
    is_weekend BOOLEAN,
    is_holiday BOOLEAN,
    is_rush_hour BOOLEAN,
    weather_condition VARCHAR(50),
    temperature DECIMAL(5,2),
    event_nearby BOOLEAN DEFAULT false, -- Concert, match, festival
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Crowd predictions (generated by ML model)
CREATE TABLE IF NOT EXISTS crowd_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_id VARCHAR(50) REFERENCES buses(id),
    route_id VARCHAR(50) REFERENCES routes(id),
    stop_id VARCHAR(50),
    predicted_crowd_percentage INT CHECK (predicted_crowd_percentage >= 0 AND predicted_crowd_percentage <= 100),
    prediction_time TIMESTAMP NOT NULL, -- When this prediction is for
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Events that affect crowd (concerts, matches, festivals)
CREATE TABLE IF NOT EXISTS crowd_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) CHECK (event_type IN ('concert', 'sports', 'festival', 'exhibition', 'conference', 'rally')),
    venue_name VARCHAR(255),
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    expected_attendance INT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    affected_routes JSONB, -- Array of route IDs
    impact_level VARCHAR(20) CHECK (impact_level IN ('low', 'medium', 'high', 'extreme')) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Rush hour definitions per city/route
CREATE TABLE IF NOT EXISTS rush_hour_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city VARCHAR(100) NOT NULL,
    route_id VARCHAR(50),
    day_type VARCHAR(20) CHECK (day_type IN ('weekday', 'weekend', 'holiday')),
    morning_rush_start TIME,
    morning_rush_end TIME,
    evening_rush_start TIME,
    evening_rush_end TIME,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(city, route_id, day_type)
);

-- Crowd model accuracy tracking
CREATE TABLE IF NOT EXISTS crowd_prediction_accuracy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID REFERENCES crowd_predictions(id),
    actual_crowd_percentage INT,
    predicted_crowd_percentage INT,
    error_percentage DECIMAL(5,2),
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crowd_history_route_time ON crowd_history(route_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_crowd_predictions_bus_time ON crowd_predictions(bus_id, prediction_time);
CREATE INDEX IF NOT EXISTS idx_crowd_events_time ON crowd_events(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_crowd_history_hour_dow ON crowd_history(hour, day_of_week);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if current time is rush hour
CREATE OR REPLACE FUNCTION is_rush_hour(
    p_city VARCHAR,
    p_route_id VARCHAR,
    p_check_time TIME DEFAULT NOW()::TIME,
    p_day_type VARCHAR DEFAULT 'weekday'
) RETURNS BOOLEAN AS $$
DECLARE
    v_config RECORD;
BEGIN
    SELECT * INTO v_config
    FROM rush_hour_config
    WHERE city = p_city
      AND (route_id = p_route_id OR route_id IS NULL)
      AND day_type = p_day_type
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    RETURN (
        (p_check_time >= v_config.morning_rush_start AND p_check_time <= v_config.morning_rush_end) OR
        (p_check_time >= v_config.evening_rush_start AND p_check_time <= v_config.evening_rush_end)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get weather-aware score for a route
CREATE OR REPLACE FUNCTION get_weather_score(p_route_id VARCHAR, p_weather_condition VARCHAR)
RETURNS DECIMAL AS $$
DECLARE
    v_score DECIMAL;
BEGIN
    SELECT recommendation_score INTO v_score
    FROM weather_route_recommendations
    WHERE route_id = p_route_id AND weather_condition = p_weather_condition
    LIMIT 1;
    
    RETURN COALESCE(v_score, 0.5); -- Default neutral score
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert rush hour config for Bangalore
INSERT INTO rush_hour_config (city, route_id, day_type, morning_rush_start, morning_rush_end, evening_rush_start, evening_rush_end)
VALUES 
    ('Bangalore', NULL, 'weekday', '07:30:00', '10:30:00', '17:00:00', '20:30:00'),
    ('Bangalore', NULL, 'weekend', '09:00:00', '11:00:00', '18:00:00', '20:00:00'),
    ('Delhi', NULL, 'weekday', '07:00:00', '10:00:00', '17:00:00', '21:00:00'),
    ('Mumbai', NULL, 'weekday', '07:00:00', '11:00:00', '17:00:00', '22:00:00'),
    ('Chennai', NULL, 'weekday', '08:00:00', '10:30:00', '17:30:00', '20:30:00')
ON CONFLICT (city, route_id, day_type) DO NOTHING;

-- Add bus stop facilities for existing stops
INSERT INTO bus_stop_facilities (stop_id, has_shelter, is_covered, cover_percentage, has_seating, has_lighting)
VALUES 
    ('kengeri-stop', true, true, 80, true, true),
    ('whitefield-stop', true, true, 90, true, true),
    ('silk-board', false, false, 0, false, true),
    ('electronic-city', true, true, 70, true, true)
ON CONFLICT (stop_id) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ New Features Schema Created Successfully!';
    RAISE NOTICE '✅ Tables: user_commute_patterns, weather_data, crowd_predictions, and more';
    RAISE NOTICE '✅ Indexes created for optimal performance';
    RAISE NOTICE '✅ Ready for Bus Buddy AI, Weather Routes, and Crowd Prediction!';
END $$;

