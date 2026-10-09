export type Role = 'donor' | 'receiver' | 'driver' | 'coordinator' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  phone?: string | null;
  organization_id?: string | null;
  is_verified: boolean;
  is_suspended: boolean;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type: 'farm' | 'restaurant' | 'shop' | 'warehouse' | 'ngo' | 'community_center' | 'food_bank' | 'other';
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FoodBatch {
  id: string;
  batch_code: string;
  donor_id: string;
  organization_id?: string | null;
  food_category: 'grains' | 'vegetables' | 'fruits' | 'dairy' | 'meat' | 'cooked_food' | 'packaged' | 'beverages' | 'other';
  food_name: string;
  description?: string | null;
  total_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  allocated_quantity: number;
  delivered_quantity: number;
  unit: 'kg' | 'liters' | 'pieces' | 'packets' | 'boxes' | 'plates' | 'servings';
  pickup_address?: string | null;
  pickup_latitude?: number | null;
  pickup_longitude?: number | null;
  harvest_time?: string | null;
  preparation_time?: string | null;
  safe_use_deadline: string;
  storage_requirements?: string | null;
  packaging_type?: string | null;
  transport_requirements?: string | null;
  photo_urls?: string[] | null;
  verification_status: 'pending' | 'verified' | 'rejected' | 'expired';
  verified_by?: string | null;
  verified_at?: string | null;
  rejection_reason?: string | null;
  withdrawal_reason?: string | null;
  is_active: boolean;
  fssai_compliant: boolean;
  safety_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: string;
  batch_id: string;
  transaction_type: 'created' | 'reserved' | 'released' | 'allocated' | 'picked_up' | 'delivered' | 'withdrawn' | 'expired' | 'adjusted';
  quantity: number;
  previous_available: number;
  new_available: number;
  reference_id?: string | null;
  performed_by?: string | null;
  reason?: string | null;
  created_at: string;
}

export interface DemandRequest {
  id: string;
  requester_id: string;
  organization_id?: string | null;
  food_category: string;
  food_name?: string | null;
  quantity_needed: number;
  unit: 'kg' | 'liters' | 'pieces' | 'packets' | 'boxes' | 'plates' | 'servings';
  people_to_serve?: number | null;
  urgency: 'low' | 'normal' | 'high' | 'critical';
  deadline?: string | null;
  delivery_address?: string | null;
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
  accessibility_requirements?: string | null;
  dietary_requirements?: string | null;
  storage_constraints?: string | null;
  status: 'pending' | 'approved' | 'partially_allocated' | 'fully_allocated' | 'in_delivery' | 'fulfilled' | 'declined' | 'cancelled' | 'expired';
  approved_by?: string | null;
  approved_at?: string | null;
  decline_reason?: string | null;
  quantity_allocated: number;
  quantity_received: number;
  duplicate_of?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Allocation {
  id: string;
  batch_id: string;
  demand_id: string;
  quantity: number;
  status: 'proposed' | 'accepted' | 'rejected' | 'dispatched' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
  priority_score?: number | null;
  spoilage_score?: number | null;
  distance_score?: number | null;
  suitability_score?: number | null;
  explanation?: string | null;
  accepted_by?: string | null;
  accepted_at?: string | null;
  rejection_reason?: string | null;
  allocated_by?: string | null;
  simulation_run_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  registration_number: string;
  vehicle_type: 'bike' | 'van' | 'truck' | 'refrigerated_truck' | 'auto_rickshaw' | 'other';
  capacity_kg: number;
  has_refrigeration: boolean;
  is_available: boolean;
  current_latitude?: number | null;
  current_longitude?: number | null;
  organization_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  profile_id: string;
  license_number?: string | null;
  vehicle_id?: string | null;
  is_available: boolean;
  current_latitude?: number | null;
  current_longitude?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  name?: string | null;
  vehicle_id?: string | null;
  driver_id?: string | null;
  status: 'planned' | 'assigned' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  total_distance_km?: number | null;
  estimated_duration_minutes?: number | null;
  actual_duration_minutes?: number | null;
  route_geometry?: any | null; 
  waypoints?: any | null; 
  is_feasible: boolean;
  infeasibility_reason?: string | null;
  alternative_route_id?: string | null;
  simulation_run_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  allocation_id: string;
  route_id?: string | null;
  driver_id?: string | null;
  status: 'pending' | 'assigned' | 'picking_up' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'returned';
  quantity_dispatched?: number | null;
  quantity_received?: number | null;
  pickup_time?: string | null;
  delivery_time?: string | null;
  failure_reason?: string | null;
  discrepancy_notes?: string | null;
  proof_of_delivery?: string | null;
  receiver_confirmation: boolean;
  damage_report?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClimateAlert {
  id: string;
  alert_type: 'drought' | 'flood' | 'cyclone' | 'heatwave' | 'cold_wave' | 'heavy_rain' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string | null;
  affected_area?: string | null;
  affected_latitude?: number | null;
  affected_longitude?: number | null;
  affected_radius_km?: number | null;
  road_closures?: any | null; 
  supply_impact_percent: number;
  demand_impact_percent: number;
  source?: string | null;
  source_updated_at?: string | null;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SimulationRun {
  id: string;
  name: string;
  scenario_type: 'normal' | 'drought' | 'flood' | 'demand_surge' | 'donor_cancellation' | 'expiring_food' | 'vehicle_breakdown' | 'road_closure' | 'combined_disruption';
  scenario_params: any;
  results?: any | null;
  supply_before?: any | null;
  supply_after?: any | null;
  demand_summary?: any | null;
  allocations_proposed: number;
  deliveries_feasible: number;
  deliveries_infeasible: number;
  unmet_demand: number;
  at_risk_stock: number;
  explanation?: string | null;
  random_seed?: number | null;
  run_by?: string | null;
  run_at: string;
  duration_ms?: number | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'food_available' | 'demand_match' | 'allocation_approved' | 'allocation_rejected' | 'pickup_assigned' | 'delivery_assigned' | 'deadline_warning' | 'delivery_failed' | 'stock_conflict' | 'climate_alert' | 'road_alert' | 'emergency_action' | 'system';
  title: string;
  message: string;
  reference_type?: string | null;
  reference_id?: string | null;
  is_read: boolean;
  is_sent: boolean;
  retry_count: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  actor_email?: string | null;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  before_state?: any | null;
  after_state?: any | null;
  reason?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface SystemConfig {
  key: string;
  value: any;
  description?: string | null;
  updated_by?: string | null;
  updated_at: string;
}

export interface RoadSegment {
  id: string;
  name?: string | null;
  from_latitude: number;
  from_longitude: number;
  to_latitude: number;
  to_longitude: number;
  distance_km: number;
  typical_duration_minutes: number;
  is_blocked: boolean;
  blocked_reason?: string | null;
  blocked_until?: string | null;
  road_type: string;
  created_at: string;
  updated_at: string;
}

export interface OfflineQueue {
  id: string;
  operation_id: string;
  user_id: string;
  operation_type: 'create_food_batch' | 'create_demand_request' | 'update_delivery_status';
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'conflict';
  conflict_details?: string | null;
  server_record_id?: string | null;
  submitted_at: string;
  processed_at?: string | null;
}
