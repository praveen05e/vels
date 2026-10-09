-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('donor', 'receiver', 'driver', 'coordinator', 'admin')),
  phone TEXT,
  organization_id UUID,
  is_verified BOOLEAN DEFAULT false,
  is_suspended BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('farm', 'restaurant', 'shop', 'warehouse', 'ngo', 'community_center', 'food_bank', 'other')),
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  contact_email TEXT,
  contact_phone TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from profiles to organizations
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_org FOREIGN KEY (organization_id) REFERENCES organizations(id);

-- 3. food_batches
CREATE TABLE food_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_code TEXT UNIQUE NOT NULL,
  donor_id UUID NOT NULL REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  food_category TEXT NOT NULL CHECK (food_category IN ('grains', 'vegetables', 'fruits', 'dairy', 'meat', 'cooked_food', 'packaged', 'beverages', 'other')),
  food_name TEXT NOT NULL,
  description TEXT,
  total_quantity NUMERIC NOT NULL CHECK (total_quantity > 0),
  available_quantity NUMERIC NOT NULL CHECK (available_quantity >= 0),
  reserved_quantity NUMERIC NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  allocated_quantity NUMERIC NOT NULL DEFAULT 0 CHECK (allocated_quantity >= 0),
  delivered_quantity NUMERIC NOT NULL DEFAULT 0 CHECK (delivered_quantity >= 0),
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'liters', 'pieces', 'packets', 'boxes', 'plates', 'servings')),
  pickup_address TEXT,
  pickup_latitude DOUBLE PRECISION,
  pickup_longitude DOUBLE PRECISION,
  harvest_time TIMESTAMPTZ,
  preparation_time TIMESTAMPTZ,
  safe_use_deadline TIMESTAMPTZ NOT NULL,
  storage_requirements TEXT,
  packaging_type TEXT,
  transport_requirements TEXT,
  photo_urls TEXT[],
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  withdrawal_reason TEXT,
  is_active BOOLEAN DEFAULT true,
  fssai_compliant BOOLEAN DEFAULT false,
  safety_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_quantity_balance CHECK (
    available_quantity + reserved_quantity + allocated_quantity + delivered_quantity <= total_quantity
  )
);

CREATE INDEX idx_food_batches_donor ON food_batches(donor_id);
CREATE INDEX idx_food_batches_category ON food_batches(food_category);
CREATE INDEX idx_food_batches_deadline ON food_batches(safe_use_deadline);
CREATE INDEX idx_food_batches_status ON food_batches(verification_status);

-- 4. inventory_transactions (audit trail for stock movements)
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES food_batches(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('created', 'reserved', 'released', 'allocated', 'picked_up', 'delivered', 'withdrawn', 'expired', 'adjusted')),
  quantity NUMERIC NOT NULL,
  previous_available NUMERIC NOT NULL,
  new_available NUMERIC NOT NULL,
  reference_id UUID, -- allocation or delivery ID
  performed_by UUID REFERENCES profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inv_tx_batch ON inventory_transactions(batch_id);

-- 5. demand_requests
CREATE TABLE demand_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  food_category TEXT NOT NULL,
  food_name TEXT,
  quantity_needed NUMERIC NOT NULL CHECK (quantity_needed > 0),
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'liters', 'pieces', 'packets', 'boxes', 'plates', 'servings')),
  people_to_serve INTEGER,
  urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'critical')),
  deadline TIMESTAMPTZ,
  delivery_address TEXT,
  delivery_latitude DOUBLE PRECISION,
  delivery_longitude DOUBLE PRECISION,
  accessibility_requirements TEXT,
  dietary_requirements TEXT,
  storage_constraints TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'partially_allocated', 'fully_allocated', 'in_delivery', 'fulfilled', 'declined', 'cancelled', 'expired')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  decline_reason TEXT,
  quantity_allocated NUMERIC DEFAULT 0,
  quantity_received NUMERIC DEFAULT 0,
  duplicate_of UUID REFERENCES demand_requests(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_demand_requester ON demand_requests(requester_id);
CREATE INDEX idx_demand_status ON demand_requests(status);
CREATE INDEX idx_demand_urgency ON demand_requests(urgency);

-- 6. allocations
CREATE TABLE allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES food_batches(id),
  demand_id UUID NOT NULL REFERENCES demand_requests(id),
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'rejected', 'dispatched', 'in_transit', 'delivered', 'failed', 'cancelled')),
  priority_score NUMERIC,
  spoilage_score NUMERIC,
  distance_score NUMERIC,
  suitability_score NUMERIC,
  explanation TEXT,
  accepted_by UUID REFERENCES profiles(id),
  accepted_at TIMESTAMPTZ,
  rejection_reason TEXT,
  allocated_by UUID REFERENCES profiles(id),
  simulation_run_id UUID, -- null for real allocations
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(batch_id, demand_id, simulation_run_id)
);

CREATE INDEX idx_alloc_batch ON allocations(batch_id);
CREATE INDEX idx_alloc_demand ON allocations(demand_id);
CREATE INDEX idx_alloc_status ON allocations(status);

-- 7. vehicles
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_number TEXT UNIQUE NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('bike', 'van', 'truck', 'refrigerated_truck', 'auto_rickshaw', 'other')),
  capacity_kg NUMERIC NOT NULL CHECK (capacity_kg > 0),
  has_refrigeration BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  current_latitude DOUBLE PRECISION,
  current_longitude DOUBLE PRECISION,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. drivers
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id),
  license_number TEXT,
  vehicle_id UUID REFERENCES vehicles(id),
  is_available BOOLEAN DEFAULT true,
  current_latitude DOUBLE PRECISION,
  current_longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. routes
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  vehicle_id UUID REFERENCES vehicles(id),
  driver_id UUID REFERENCES drivers(id),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'assigned', 'in_progress', 'completed', 'failed', 'cancelled')),
  total_distance_km NUMERIC,
  estimated_duration_minutes INTEGER,
  actual_duration_minutes INTEGER,
  route_geometry JSONB, -- GeoJSON line
  waypoints JSONB, -- ordered pickup/dropoff points
  is_feasible BOOLEAN DEFAULT true,
  infeasibility_reason TEXT,
  alternative_route_id UUID REFERENCES routes(id),
  simulation_run_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. deliveries
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  allocation_id UUID NOT NULL REFERENCES allocations(id),
  route_id UUID REFERENCES routes(id),
  driver_id UUID REFERENCES drivers(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picking_up', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned')),
  quantity_dispatched NUMERIC,
  quantity_received NUMERIC,
  pickup_time TIMESTAMPTZ,
  delivery_time TIMESTAMPTZ,
  failure_reason TEXT,
  discrepancy_notes TEXT,
  proof_of_delivery TEXT, -- photo URL
  receiver_confirmation BOOLEAN DEFAULT false,
  damage_report TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deliveries_allocation ON deliveries(allocation_id);
CREATE INDEX idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);

-- 11. climate_alerts
CREATE TABLE climate_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('drought', 'flood', 'cyclone', 'heatwave', 'cold_wave', 'heavy_rain', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  affected_area TEXT,
  affected_latitude DOUBLE PRECISION,
  affected_longitude DOUBLE PRECISION,
  affected_radius_km NUMERIC,
  road_closures JSONB, -- array of affected road segments
  supply_impact_percent NUMERIC DEFAULT 0,
  demand_impact_percent NUMERIC DEFAULT 0,
  source TEXT,
  source_updated_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. simulation_runs
CREATE TABLE simulation_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('normal', 'drought', 'flood', 'demand_surge', 'donor_cancellation', 'expiring_food', 'vehicle_breakdown', 'road_closure', 'combined_disruption')),
  scenario_params JSONB NOT NULL DEFAULT '{}',
  results JSONB,
  supply_before JSONB,
  supply_after JSONB,
  demand_summary JSONB,
  allocations_proposed INTEGER DEFAULT 0,
  deliveries_feasible INTEGER DEFAULT 0,
  deliveries_infeasible INTEGER DEFAULT 0,
  unmet_demand NUMERIC DEFAULT 0,
  at_risk_stock NUMERIC DEFAULT 0,
  explanation TEXT,
  random_seed INTEGER,
  run_by UUID REFERENCES profiles(id),
  run_at TIMESTAMPTZ DEFAULT NOW(),
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('food_available', 'demand_match', 'allocation_approved', 'allocation_rejected', 'pickup_assigned', 'delivery_assigned', 'deadline_warning', 'delivery_failed', 'stock_conflict', 'climate_alert', 'road_alert', 'emergency_action', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_type TEXT, -- 'food_batch', 'demand_request', 'allocation', 'delivery', etc.
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  is_sent BOOLEAN DEFAULT false,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);

-- 14. audit_logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id),
  actor_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  before_state JSONB,
  after_state JSONB,
  reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- 15. system_config
CREATE TABLE system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. road_segments (sample road graph for routing)
CREATE TABLE road_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  from_latitude DOUBLE PRECISION NOT NULL,
  from_longitude DOUBLE PRECISION NOT NULL,
  to_latitude DOUBLE PRECISION NOT NULL,
  to_longitude DOUBLE PRECISION NOT NULL,
  distance_km NUMERIC NOT NULL,
  typical_duration_minutes INTEGER NOT NULL,
  is_blocked BOOLEAN DEFAULT false,
  blocked_reason TEXT,
  blocked_until TIMESTAMPTZ,
  road_type TEXT DEFAULT 'primary',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. offline_queue (for tracking offline submissions)
CREATE TABLE offline_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id TEXT UNIQUE NOT NULL, -- client-generated unique ID to prevent duplicates
  user_id UUID NOT NULL REFERENCES profiles(id),
  operation_type TEXT NOT NULL CHECK (operation_type IN ('create_food_batch', 'create_demand_request', 'update_delivery_status')),
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'conflict')),
  conflict_details TEXT,
  server_record_id UUID,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_organizations_updated BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_food_batches_updated BEFORE UPDATE ON food_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_demand_requests_updated BEFORE UPDATE ON demand_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_allocations_updated BEFORE UPDATE ON allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_vehicles_updated BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_drivers_updated BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_routes_updated BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_deliveries_updated BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_climate_alerts_updated BEFORE UPDATE ON climate_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_road_segments_updated BEFORE UPDATE ON road_segments FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Helper function to avoid infinite recursion when checking roles
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE climate_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE road_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_queue ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read own profile, admins can read all, coordinators can read all
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins and coordinators can read all profiles" ON profiles FOR SELECT USING (get_user_role() IN ('admin', 'coordinator'));
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (get_user_role() = 'admin');

-- Organizations: All authenticated users can read, owners and admins can update
CREATE POLICY "Authenticated users can read organizations" ON organizations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Owners and admins can update organizations" ON organizations FOR ALL USING (auth.uid() = created_by OR get_user_role() = 'admin');

-- Food Batches: Donors can CRUD their own, receivers/coordinators/admins can read all active
CREATE POLICY "Donors can CRUD own food batches" ON food_batches FOR ALL USING (auth.uid() = donor_id);
CREATE POLICY "Receivers/coordinators/admins read active batches" ON food_batches FOR SELECT USING (
  is_active = true AND get_user_role() IN ('receiver', 'coordinator', 'admin')
);

-- Demand Requests: Receivers can CRUD their own, donors can read approved, coordinators/admins can manage all
CREATE POLICY "Receivers can CRUD own demand requests" ON demand_requests FOR ALL USING (auth.uid() = requester_id);
CREATE POLICY "Donors can read approved demand requests" ON demand_requests FOR SELECT USING (status = 'approved' AND get_user_role() = 'donor');
CREATE POLICY "Coordinators and admins can manage all demand requests" ON demand_requests FOR ALL USING (get_user_role() IN ('coordinator', 'admin'));

-- Allocations: Related donors/receivers can read their own, coordinators/admins can manage all
CREATE POLICY "Donors and Receivers can read own allocations" ON allocations FOR SELECT USING (
  auth.uid() IN (
    (SELECT donor_id FROM food_batches WHERE id = allocations.batch_id),
    (SELECT requester_id FROM demand_requests WHERE id = allocations.demand_id)
  )
);
CREATE POLICY "Coordinators and admins manage all allocations" ON allocations FOR ALL USING (get_user_role() IN ('coordinator', 'admin'));

-- Vehicles/Drivers: Drivers can read/update own, coordinators/admins manage all
CREATE POLICY "Drivers can read and update own vehicle" ON vehicles FOR ALL USING (
  id IN (SELECT vehicle_id FROM drivers WHERE profile_id = auth.uid())
);
CREATE POLICY "Coordinators and admins manage vehicles" ON vehicles FOR ALL USING (get_user_role() IN ('coordinator', 'admin'));

CREATE POLICY "Drivers can read and update own driver profile" ON drivers FOR ALL USING (profile_id = auth.uid());
CREATE POLICY "Coordinators and admins manage drivers" ON drivers FOR ALL USING (get_user_role() IN ('coordinator', 'admin'));

-- Routes/Deliveries: Assigned drivers can read/update own, coordinators/admins manage all
CREATE POLICY "Assigned drivers read/update own routes" ON routes FOR ALL USING (
  driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
);
CREATE POLICY "Coordinators and admins manage routes" ON routes FOR ALL USING (get_user_role() IN ('coordinator', 'admin'));

CREATE POLICY "Assigned drivers read/update own deliveries" ON deliveries FOR ALL USING (
  driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
);
CREATE POLICY "Coordinators and admins manage deliveries" ON deliveries FOR ALL USING (get_user_role() IN ('coordinator', 'admin'));

-- Notifications: Users can only read their own
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (user_id = auth.uid());

-- Audit Logs: Only admins and coordinators can read
CREATE POLICY "Admins and coordinators can read audit logs" ON audit_logs FOR SELECT USING (get_user_role() IN ('admin', 'coordinator'));

-- System Config: Only admins can modify, coordinators can read
CREATE POLICY "Admins and coordinators can read system config" ON system_config FOR SELECT USING (get_user_role() IN ('admin', 'coordinator'));
CREATE POLICY "Admins can modify system config" ON system_config FOR ALL USING (get_user_role() = 'admin');
