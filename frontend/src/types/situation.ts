export type RiskLevel = 'LOW' | 'ELEVATED' | 'SEVERE' | 'CRITICAL';
export type HazardTrend = 'RISING' | 'STABLE' | 'RECEDING';
export type AlertLifecycle = 'DETECTED' | 'PENDING_LOCAL_REVIEW' | 'CONFIRMED' | 'MONITORING' | 'ESCALATED' | 'ACTIVE_RESPONSE' | 'RESOLVED';
export type RouteStatus = 'ACCESSIBLE' | 'BLOCKED' | 'UNCERTAIN' | 'CAUTION_WATERLOGGING' | 'REPLANNED_ALTERNATE';
export type DroneRole = 'E-SCOUT' | 'E-CARGO';
export type DroneStatus = 'STANDBY' | 'IN_FLIGHT' | 'MISSION_ACTIVE' | 'RETURNING' | 'CHARGING';
export type MeshLinkStatus = 'STRONG' | 'RELAY' | 'NO_UPLINK';
export type MissionType = 'RECONNAISSANCE' | 'RESCUE_DISPATCH' | 'CARGO_DELIVERY' | 'MEDICAL_DEPLOYMENT' | 'EVACUATION_ESCORT';
export type MissionApprovalState = 'PROPOSED' | 'AWAITING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type IncidentStatus = 'POSSIBLE_INCIDENT' | 'VERIFIED_TARGET' | 'RESCUE_IN_PROGRESS' | 'RESCUED' | 'CANCELLED';
export type MutualAidState = 'DRAFTED' | 'AWAITING_AUTHORITY_APPROVAL' | 'APPROVED_TRANSMITTED' | 'DISPATCHED' | 'FULFILLED';

export interface Zone {
  id: string;
  name: string;
  risk_level: RiskLevel;
  uncertainty: 'LOW' | 'MODERATE' | 'HIGH';
  risk_score: number;
  population_exposed: number;
  water_level_m: number;
  hazard_trend: HazardTrend;
  latest_evidence: string;
  coordinates: [number, number][];
  center: [number, number];
}

export interface PredictionInput {
  id: string;
  zone_id?: string | null;
  source_type: string;
  source_id: string;
  timestamp: string;
  freshness_min: number;
  confidence_pct: number;
  metric_name: string;
  reading_value: string;
  status: 'VERIFIED' | 'UNVERIFIED' | 'STALE' | 'DISPUTED';
  location_desc: string;
}

export interface Alert {
  id: string;
  title: string;
  level: string;
  lifecycle: AlertLifecycle;
  detected_at: string;
  zone_id: string;
  location_name: string;
  risk_level: RiskLevel;
  confidence_pct: number;
  evidence_summary: string[];
  timer_seconds_remaining: number;
  escalated_to?: string | null;
  authority_decision?: {
    decision: string;
    decided_by: string;
    timestamp: string;
    notes: string;
  } | null;
}

export interface Route {
  id: string;
  name: string;
  endpoints: string[];
  status: RouteStatus;
  access_score: number;
  source: string;
  freshness_min: number;
  confidence_pct: number;
  coordinates: [number, number][];
  notes: string;
}

export interface Shelter {
  id: string;
  name: string;
  zone_id: string;
  location: [number, number];
  capacity: number;
  occupancy: number;
  safe_margin: number;
  medical_need: string;
  food_days_remaining: number;
  water_liters: number;
  doctors_present: number;
  status: string;
}

export interface Resource {
  id: string;
  name: string;
  kind: 'RESCUE_TEAM' | 'RESCUE_BOAT' | 'MEDICAL_TEAM' | 'NGO_VOLUNTEERS' | 'AMBULANCE';
  station_location: string;
  current_coords: [number, number];
  status: string;
  assigned_mission_id?: string | null;
  capacity_persons: number;
}

export interface Drone {
  id: string;
  callsign: string;
  role: DroneRole;
  station_id: string;
  location: [number, number];
  battery_pct: number;
  payload_capacity_kg: number;
  current_payload_kg: number;
  status: DroneStatus;
  mesh_status: MeshLinkStatus;
  mesh_rssi_dbm: number;
  current_mission_id?: string | null;
  last_telemetry_time: string;
}

export interface Mission {
  id: string;
  title: string;
  type: MissionType;
  priority: string;
  target_zone_id: string;
  target_coords: [number, number];
  assigned_resources: string[];
  approval_state: MissionApprovalState;
  explanation: {
    evidence: string;
    confidence_pct: number;
    urgency: string;
    approval_required: boolean;
    recommended_shelter?: string;
    payload_description?: string;
    risk_mitigation?: string;
  };
  created_at: string;
  status_notes: string;
}

export interface RescueIncident {
  id: string;
  title: string;
  zone_id: string;
  coords: [number, number];
  type: string;
  estimated_count: number;
  confidence_pct: number;
  status: IncidentStatus;
  source_drone_id?: string | null;
  video_timestamp?: string | null;
  verified_by?: string | null;
}

export interface StockItem {
  id: string;
  name: string;
  category: 'FOOD' | 'WATER' | 'MEDICINE' | 'FIRST_AID' | 'SHELTER';
  quantity: number;
  unit: string;
  depot_location: string;
  min_threshold: number;
  status: 'ADEQUATE' | 'LOW_STOCK' | 'CRITICAL_SHORTAGE';
}

export interface MutualAidRequest {
  id: string;
  item_requested: string;
  quantity: number;
  unit: string;
  urgency: string;
  target_location: string;
  recommended_source: string;
  proposed_route: string;
  state: MutualAidState;
  approved_by?: string | null;
  approved_at?: string | null;
  fulfillment_notes?: string | null;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  source_module: string;
  action: string;
  details: string;
  confidence_pct?: number;
  user_id?: string;
}

export interface SharedSituationModel {
  incident_name: string;
  incident_phase: string;
  last_updated: string;
  active_authority?: string | null;
  is_authenticated: boolean;
  zones: Zone[];
  alert: Alert;
  routes: Route[];
  shelters: Shelter[];
  resources: Resource[];
  drones: Drone[];
  missions: Mission[];
  incidents: RescueIncident[];
  inventory: StockItem[];
  mutual_aid_requests: MutualAidRequest[];
  recent_inputs: PredictionInput[];
  audit_log: AuditEvent[];
}

export interface EvidenceRoute {
  access: number;
  route_id: string | null;
  distance_km: number | null;
  linked_routes: number;
  note: string;
}

export interface ConfidenceComponents {
  mean_confidence: number;
  staleness: number;
  agreement: number;
  recency: number;
  completeness: number;
}

export interface EvidenceConfidence {
  confidence: number;
  components: ConfidenceComponents;
  inputs: number;
  note: string;
}

export interface ZoneScore {
  zone_id: string;
  name: string;
  need: number;
  confidence_pct: number;
  uncertainty_pct: number;
  info_value: number;
  access: number;
  components: {
    exposure: number;
    severity: number;
    trend: number;
    isolation: number;
  };
  evidence: {
    route: EvidenceRoute;
    confidence: EvidenceConfidence;
    declared_uncertainty: string;
  };
  need_rank: number;
  gap_rank: number;
  action: 'DISPATCH' | 'VERIFY_THEN_DISPATCH' | 'RECON' | 'MONITOR';
}

export interface AssignedResource {
  resource_id: string;
  kind: string;
  capacity: number;
  eta_min: number;
  distance_km: number;
  station_access: number;
  utility: number;
}

export interface Assignment {
  task_id: string;
  zone_id: string;
  type: string;
  resources: AssignedResource[];
  covered_persons: number;
  required_persons: number;
  coverage: number;
  worst_case_eta_min: number;
  needs_verification: boolean;
  reason: string;
}

export interface ReconProposal {
  zone_id: string;
  zone_name: string;
  drone_id: string;
  callsign: string;
  info_value: number;
  need: number;
  confidence_pct: number;
  expected_confidence_gain_pct: number;
  reasons: string[];
  rule: string;
}

export interface DerivedState {
  version: number;
  zones: Record<string, ZoneScore>;
  allocation: {
    assignments: Assignment[];
    unassigned: { task_id: string; zone_id: string; reason: string }[];
    decision_log: any[];
    resources_used: number;
  };
  recon: {
    proposals: ReconProposal[];
    unflyable: { zone_id: string; reason: string }[];
    candidates: number;
  };
  counts: {
    zones: number;
    tasks: number;
    assigned: number;
    unassigned: number;
    recon_proposals: number;
  };
}

