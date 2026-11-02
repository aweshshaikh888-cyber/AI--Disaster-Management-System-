export type UserRole = 'ADMIN' | 'OFFICER' | 'RESCUE' | 'ANALYST';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  full_name?: string;
  agency?: string;
  phone?: string;
  badge_number?: string;
}

export type DisasterType = 'Earthquake' | 'Flood' | 'Cyclone' | 'Landslide' | 'Fire' | 'Building Collapse';

export type DamageSeverity = 'No Damage' | 'Low Damage' | 'Moderate Damage' | 'Severe Damage' | 'Critical Damage';

export type IncidentStatus = 'Reported' | 'Under Review' | 'Confirmed' | 'Response Initiated' | 'Resolved' | 'Closed';

export type PriorityCategory = 'Low' | 'Medium' | 'High' | 'Critical';

export interface IncidentTimelineEvent {
  id: number;
  incident_id: number;
  timestamp: string;
  author: string;
  action: string;
  notes?: string;
}

export interface Incident {
  id: number;
  incident_code: string;
  title: string;
  disaster_type: DisasterType;
  severity: DamageSeverity;
  status: IncidentStatus;
  description?: string;
  location_name: string;
  latitude: number;
  longitude: number;
  priority_score: number;
  priority_category: PriorityCategory;
  affected_people_est: number;
  critical_infra_affected: boolean;
  medical_emergency: boolean;
  image_url?: string;
  gradcam_url?: string;
  ai_confidence?: number;
  reported_by?: string;
  reporter_contact?: string;
  assigned_officer?: string;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AIAnalysisResult {
  analysis_id: string;
  filename: string;
  image_url: string;
  gradcam_url: string;
  predicted_class: DamageSeverity;
  confidence: number;
  confidence_percentage: number;
  severity_level: string;
  disaster_type: string;
  location_name: string;
  latitude: number;
  longitude: number;
  class_probabilities: Record<string, number>;
  feature_metrics: {
    mean_edge_intensity: number;
    spatial_entropy: number;
    high_frequency_debris_index: number;
    structural_coherence: number;
  };
  recommended_actions: string[];
  structural_safety_disclaimer: string;
  model_version: string;
  model_name: string;
  execution_time_ms: number;
  timestamp: string;
  is_demo_calibrated: boolean;
  db_id?: number;
}

export type TeamStatus = 'Available' | 'Assigned' | 'En Route' | 'On Site' | 'Completed';

export interface RescueTeam {
  id: number;
  name: string;
  specialization: string;
  lead_name: string;
  contact_phone: string;
  member_count: number;
  status: TeamStatus;
  latitude?: number;
  longitude?: number;
  equipment_summary?: string;
  vehicle_info?: string;
}

export interface HospitalShelter {
  id: number;
  name: string;
  facility_type: 'Hospital' | 'Temporary Shelter' | 'Relief Camp' | 'Emergency Clinic';
  address: string;
  latitude: number;
  longitude: number;
  contact_phone: string;
  total_capacity: number;
  available_capacity: number;
  services: string;
  is_verified: boolean;
  status: string;
  distance_km?: number;
}

export interface EmergencyResource {
  id: number;
  name: string;
  category: 'Medical' | 'Vehicles' | 'Rescue Gear' | 'Food & Water' | 'Shelter';
  total_quantity: number;
  available_quantity: number;
  unit: string;
  warehouse_location: string;
  min_threshold: number;
  status: 'Adequate' | 'Low Stock' | 'Critical';
}

export interface ResourceRequest {
  id: number;
  resource_id: number;
  resource_name: string;
  category: string;
  unit: string;
  requested_quantity: number;
  urgency: string;
  status: string;
  requested_by: string;
  incident_code: string;
  created_at: string;
}

export interface EmergencyNotification {
  id: number;
  title: string;
  message: string;
  severity: string;
  target_channel: string;
  target_region: string;
  is_test_mode: boolean;
  sent_by: string;
  acknowledged: boolean;
  recipients_count: number;
  delivery_status: string;
  created_at: string;
}

export interface WeatherAlert {
  id: number;
  location: string;
  weather_condition: string;
  temperature: number;
  wind_speed_kmh: number;
  humidity: number;
  rainfall_mm: number;
  risk_level: string;
  warning_title: string;
  official_advisory: string;
  is_authoritative: boolean;
  timestamp: string;
}

export interface AuditLog {
  id: number;
  username: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  ip_address: string;
  timestamp: string;
}

export interface Drone {
  id: string;
  name: string;
  status: string;
  battery_pct: number;
  altitude_m: number;
  speed_kmh: number;
  latitude: number;
  longitude: number;
  heading_deg: number;
  camera_mode: string;
  connection_signal: string;
  mission: string;
  feed_url: string;
  is_simulated: boolean;
}
