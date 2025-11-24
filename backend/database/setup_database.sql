-- Complete database setup for Bus Buddy AI
-- This script creates the database and all necessary tables

-- Create database (run this as postgres superuser)
-- CREATE DATABASE bmtc_realtime;

-- Connect to the database
-- \c bmtc_realtime;

-- PostGIS extension not required for basic functionality
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bus stops table
CREATE TABLE IF NOT EXISTS bus_stops (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    city VARCHAR(100) DEFAULT 'Bangalore',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bus routes table
CREATE TABLE IF NOT EXISTS bus_routes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    from_stop VARCHAR(255),
    to_stop VARCHAR(255),
    distance DECIMAL(8, 2),
    duration INTEGER, -- in minutes
    frequency VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- User commute patterns table
CREATE TABLE IF NOT EXISTS user_commute_patterns (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    route_id VARCHAR(50) REFERENCES bus_routes(id),
    from_stop_id VARCHAR(50) REFERENCES bus_stops(id),
    to_stop_id VARCHAR(50) REFERENCES bus_stops(id),
    departure_time TIME,
    arrival_time TIME,
    day_of_week VARCHAR(20),
    frequency VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- User commute preferences table
CREATE TABLE IF NOT EXISTS user_commute_preferences (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preferred_routes JSONB,
    preferred_times JSONB,
    avoid_crowded_routes BOOLEAN DEFAULT false,
    weather_awareness BOOLEAN DEFAULT true,
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Commute suggestions table
CREATE TABLE IF NOT EXISTS commute_suggestions (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    suggestion_type VARCHAR(50),
    title VARCHAR(255),
    description TEXT,
    route_id VARCHAR(50) REFERENCES bus_routes(id),
    estimated_time INTEGER, -- in minutes
    confidence_score DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Weather data table
CREATE TABLE IF NOT EXISTS weather_data (
    id VARCHAR(50) PRIMARY KEY,
    city VARCHAR(100),
    temperature DECIMAL(5, 2),
    humidity INTEGER,
    weather_condition VARCHAR(50),
    wind_speed DECIMAL(5, 2),
    visibility DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Flood reports table
CREATE TABLE IF NOT EXISTS flood_reports (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    location VARCHAR(255),
    severity VARCHAR(20),
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crowd predictions table
CREATE TABLE IF NOT EXISTS crowd_predictions (
    id VARCHAR(50) PRIMARY KEY,
    route_id VARCHAR(50) REFERENCES bus_routes(id),
    stop_id VARCHAR(50) REFERENCES bus_stops(id),
    predicted_crowd_level VARCHAR(20),
    confidence_score DECIMAL(3, 2),
    prediction_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crowd prediction history table
CREATE TABLE IF NOT EXISTS crowd_prediction_history (
    id VARCHAR(50) PRIMARY KEY,
    route_id VARCHAR(50) REFERENCES bus_routes(id),
    stop_id VARCHAR(50) REFERENCES bus_stops(id),
    actual_crowd_level VARCHAR(20),
    predicted_crowd_level VARCHAR(20),
    accuracy_score DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_commute_patterns_user_id ON user_commute_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_commute_patterns_route_id ON user_commute_patterns(route_id);
CREATE INDEX IF NOT EXISTS idx_commute_suggestions_user_id ON commute_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_commute_suggestions_route_id ON commute_suggestions(route_id);
CREATE INDEX IF NOT EXISTS idx_crowd_predictions_route_id ON crowd_predictions(route_id);
CREATE INDEX IF NOT EXISTS idx_crowd_predictions_stop_id ON crowd_predictions(stop_id);
CREATE INDEX IF NOT EXISTS idx_weather_data_city ON weather_data(city);
CREATE INDEX IF NOT EXISTS idx_weather_data_created_at ON weather_data(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
