-- Create demo user for testing new features
-- Run this after running new_features_schema.sql

-- Insert bus stops if they don't exist
INSERT INTO bus_stops (id, name, latitude, longitude, city, created_at)
VALUES 
    ('kengeri-stop', 'Kengeri Bus Terminal', 12.9141, 77.4855, 'Bangalore', NOW()),
    ('whitefield-stop', 'Whitefield Main Road', 12.9698, 77.7500, 'Bangalore', NOW()),
    ('shivajinagar-stop', 'Shivajinagar Bus Stand', 12.9899, 77.6006, 'Bangalore', NOW()),
    ('electronic-city-stop', 'Electronic City Phase 1', 12.8451, 77.6601, 'Bangalore', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert demo user
INSERT INTO users (id, phone_number, email, name, wallet_balance, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '9999999999',
    'demo@whereismybus.com',
    'Demo User',
    100.00,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insert demo commute preferences
INSERT INTO user_commute_preferences (
    user_id,
    prefer_ac,
    prefer_less_crowded,
    prefer_faster_route,
    max_walking_distance,
    notification_lead_time,
    auto_suggest_enabled
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    true,
    true,
    true,
    500,
    15,
    true
)
ON CONFLICT (user_id) DO UPDATE SET
    prefer_ac = EXCLUDED.prefer_ac,
    prefer_less_crowded = EXCLUDED.prefer_less_crowded,
    prefer_faster_route = EXCLUDED.prefer_faster_route,
    max_walking_distance = EXCLUDED.max_walking_distance,
    notification_lead_time = EXCLUDED.notification_lead_time,
    auto_suggest_enabled = EXCLUDED.auto_suggest_enabled,
    updated_at = NOW();

-- Insert some demo commute patterns (so user can see patterns immediately)
INSERT INTO user_commute_patterns (
    user_id,
    route_id,
    source_stop_id,
    destination_stop_id,
    typical_departure_time,
    typical_days,
    frequency,
    average_duration,
    last_traveled,
    created_at
)
VALUES 
    (
        '00000000-0000-0000-0000-000000000001',
        'bmtc-335E',
        'kengeri-stop',
        'whitefield-stop',
        '08:30:00',
        '["monday", "tuesday", "wednesday", "thursday", "friday"]',
        12,
        45,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '30 days'
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        'bmtc-500C',
        'shivajinagar-stop',
        'electronic-city-stop',
        '18:00:00',
        '["monday", "wednesday", "friday"]',
        8,
        55,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '20 days'
    )
ON CONFLICT DO NOTHING;

-- Insert some demo suggestions
INSERT INTO commute_suggestions (
    user_id,
    route_id,
    suggestion_type,
    title,
    message,
    suggested_departure_time,
    confidence_score,
    created_at
)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'bmtc-335E',
        'leave_now',
        '🚌 Time to Leave!',
        'Leave now to catch 335E to Whitefield. Next bus in 8 minutes.',
        NOW() + INTERVAL '8 minutes',
        0.87,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        'bmtc-500C',
        'delay_alert',
        '⚠️ Traffic Alert',
        'Heavy traffic on Hosur Road. Consider taking alternate route.',
        NULL,
        0.72,
        NOW() - INTERVAL '30 minutes'
    )
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Demo user created successfully!';
    RAISE NOTICE '✅ User ID: 00000000-0000-0000-0000-000000000001';
    RAISE NOTICE '✅ Commute patterns added';
    RAISE NOTICE '✅ Suggestions added';
    RAISE NOTICE '✅ You can now test Bus Buddy AI!';
END $$;

