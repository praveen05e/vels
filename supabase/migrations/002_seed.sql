-- DEMO DATA: This seed data is for demonstration purposes only

-- 1. Insert default system_config values
INSERT INTO system_config (key, value, description) VALUES
('allocation_weights', '{"spoilage": 0.3, "priority": 0.25, "distance": 0.2, "suitability": 0.15, "fairness": 0.1}'::jsonb, 'These are configurable assumptions, not validated scientific parameters'),
('max_delivery_distance_km', '50'::jsonb, 'Maximum allowable delivery distance in km'),
('min_food_safety_hours', '2'::jsonb, 'Minimum remaining hours for safe food consumption');

-- 2. Insert 5 organizations (Mix of farms, restaurants, NGOs, food banks in Chennai area)
INSERT INTO organizations (id, name, type, address, city, state, pincode, latitude, longitude, contact_email, contact_phone, is_verified, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Chennai Food Bank', 'food_bank', '123 Anna Salai', 'Chennai', 'Tamil Nadu', '600002', 13.0604, 80.2644, 'contact@chennaifoodbank.org', '9876543210', true, true),
('22222222-2222-2222-2222-222222222222', 'Saravana Bhavan Adyar', 'restaurant', '15 Gandhi Nagar', 'Chennai', 'Tamil Nadu', '600020', 13.0063, 80.2574, 'adyar@saravanabhavan.in', '9876543211', true, true),
('33333333-3333-3333-3333-333333333333', 'Velachery Community Center', 'community_center', '45 100 Feet Road', 'Chennai', 'Tamil Nadu', '600042', 12.9815, 80.2180, 'help@velacherycc.org', '9876543212', true, true),
('44444444-4444-4444-4444-444444444444', 'Green Earth Organic Farms', 'farm', 'ECR Road, Injambakkam', 'Chennai', 'Tamil Nadu', '600115', 12.9229, 80.2553, 'farm@greenearth.in', '9876543213', true, true),
('55555555-5555-5555-5555-555555555555', 'Smile Foundation NGO', 'ngo', '78 T Nagar', 'Chennai', 'Tamil Nadu', '600017', 13.0418, 80.2341, 'chennai@smilefoundation.org', '9876543214', true, true);

-- 3. Insert sample road_segments forming a graph between these locations (~15 segments)
INSERT INTO road_segments (name, from_latitude, from_longitude, to_latitude, to_longitude, distance_km, typical_duration_minutes) VALUES
('Anna Salai to T Nagar', 13.0604, 80.2644, 13.0418, 80.2341, 4.5, 15),
('T Nagar to Anna Salai', 13.0418, 80.2341, 13.0604, 80.2644, 4.5, 15),
('T Nagar to Adyar', 13.0418, 80.2341, 13.0063, 80.2574, 5.2, 18),
('Adyar to T Nagar', 13.0063, 80.2574, 13.0418, 80.2341, 5.2, 18),
('Adyar to Velachery', 13.0063, 80.2574, 12.9815, 80.2180, 6.0, 20),
('Velachery to Adyar', 12.9815, 80.2180, 13.0063, 80.2574, 6.0, 20),
('Adyar to Injambakkam', 13.0063, 80.2574, 12.9229, 80.2553, 9.5, 25),
('Injambakkam to Adyar', 12.9229, 80.2553, 13.0063, 80.2574, 9.5, 25),
('Velachery to Injambakkam', 12.9815, 80.2180, 12.9229, 80.2553, 11.2, 30),
('Injambakkam to Velachery', 12.9229, 80.2553, 12.9815, 80.2180, 11.2, 30),
('Anna Salai to Adyar', 13.0604, 80.2644, 13.0063, 80.2574, 8.1, 22),
('Adyar to Anna Salai', 13.0063, 80.2574, 13.0604, 80.2644, 8.1, 22),
('Anna Salai to Velachery', 13.0604, 80.2644, 12.9815, 80.2180, 12.5, 35),
('Velachery to Anna Salai', 12.9815, 80.2180, 13.0604, 80.2644, 12.5, 35),
('T Nagar to Velachery', 13.0418, 80.2341, 12.9815, 80.2180, 7.8, 25);

-- 4. Insert 3 vehicles with varying capacities
INSERT INTO vehicles (id, registration_number, vehicle_type, capacity_kg, has_refrigeration, is_available, current_latitude, current_longitude, organization_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TN-01-AB-1234', 'bike', 50.0, false, true, 13.0604, 80.2644, '11111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'TN-07-CD-5678', 'van', 500.0, false, true, 13.0063, 80.2574, '22222222-2222-2222-2222-222222222222'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'TN-09-EF-9012', 'refrigerated_truck', 2000.0, true, true, 12.9815, 80.2180, '11111111-1111-1111-1111-111111111111');

-- 5. Insert sample climate_alerts (one active flood warning, one drought warning)
INSERT INTO climate_alerts (alert_type, severity, title, description, affected_area, affected_latitude, affected_longitude, affected_radius_km, is_active, starts_at, ends_at) VALUES
('flood', 'high', 'Velachery Flooding Warning', 'Heavy rains expected to cause localized flooding in low-lying areas of Velachery.', 'Velachery', 12.9815, 80.2180, 5.0, true, NOW(), NOW() + INTERVAL '3 days'),
('drought', 'medium', 'Water Scarcity in South Chennai', 'Reduced water supply affecting farm yields in the southern outskirts of Chennai.', 'Injambakkam area', 12.9229, 80.2553, 10.0, true, NOW() - INTERVAL '1 month', NOW() + INTERVAL '2 months');
