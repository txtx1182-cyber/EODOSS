from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "LOW"
    ELEVATED = "ELEVATED"
    SEVERE = "SEVERE"
    CRITICAL = "CRITICAL"

class HazardTrend(str, Enum):
    RISING = "RISING"
    STABLE = "STABLE"
    RECEDING = "RECEDING"

class AlertLifecycle(str, Enum):
    DETECTED = "DETECTED"
    PENDING_LOCAL_REVIEW = "PENDING_LOCAL_REVIEW"
    CONFIRMED = "CONFIRMED"
    MONITORING = "MONITORING"
    ESCALATED = "ESCALATED"
    ACTIVE_RESPONSE = "ACTIVE_RESPONSE"
    RESOLVED = "RESOLVED"

class RouteStatus(str, Enum):
    ACCESSIBLE = "ACCESSIBLE"
    BLOCKED = "BLOCKED"
    UNCERTAIN = "UNCERTAIN"
    CAUTION_WATERLOGGING = "CAUTION_WATERLOGGING"
    REPLANNED_ALTERNATE = "REPLANNED_ALTERNATE"

class DroneRole(str, Enum):
    E_SCOUT = "E-SCOUT"
    E_CARGO = "E-CARGO"

class DroneStatus(str, Enum):
    STANDBY = "STANDBY"
    IN_FLIGHT = "IN_FLIGHT"
    MISSION_ACTIVE = "MISSION_ACTIVE"
    RETURNING = "RETURNING"
    CHARGING = "CHARGING"

class MeshLinkStatus(str, Enum):
    STRONG = "STRONG"
    RELAY = "RELAY"
    NO_UPLINK = "NO_UPLINK"

class MissionType(str, Enum):
    RECONNAISSANCE = "RECONNAISSANCE"
    RESCUE_DISPATCH = "RESCUE_DISPATCH"
    CARGO_DELIVERY = "CARGO_DELIVERY"
    MEDICAL_DEPLOYMENT = "MEDICAL_DEPLOYMENT"
    EVACUATION_ESCORT = "EVACUATION_ESCORT"

class MissionApprovalState(str, Enum):
    PROPOSED = "PROPOSED"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    APPROVED = "APPROVED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class IncidentStatus(str, Enum):
    POSSIBLE_INCIDENT = "POSSIBLE_INCIDENT"
    VERIFIED_TARGET = "VERIFIED_TARGET"
    RESCUE_IN_PROGRESS = "RESCUE_IN_PROGRESS"
    RESCUED = "RESCUED"
    CANCELLED = "CANCELLED"

class MutualAidState(str, Enum):
    DRAFTED = "DRAFTED"
    AWAITING_AUTHORITY_APPROVAL = "AWAITING_AUTHORITY_APPROVAL"
    APPROVED_TRANSMITTED = "APPROVED_TRANSMITTED"
    DISPATCHED = "DISPATCHED"
    FULFILLED = "FULFILLED"

# Core Models
class Zone(BaseModel):
    id: str
    name: str
    risk_level: RiskLevel
    uncertainty: str # "LOW", "MODERATE", "HIGH"
    risk_score: float # 0.0 - 100.0
    population_exposed: int
    water_level_m: float
    hazard_trend: HazardTrend
    latest_evidence: str
    coordinates: List[List[float]] # polygon [[lat, lng], ...]
    center: List[float] # [lat, lng]

class PredictionInput(BaseModel):
    id: str
    source_type: str # "WEATHER_RADAR", "RIVER_SENSOR", "LISS4_SATELLITE", "FIELD_REPORT", "DRONE_TELEMETRY"
    source_id: str
    timestamp: str
    freshness_min: int
    confidence_pct: int
    metric_name: str
    reading_value: str
    status: str # "VERIFIED", "UNVERIFIED", "STALE", "DISPUTED"
    location_desc: str

class Alert(BaseModel):
    id: str
    title: str
    level: str
    lifecycle: AlertLifecycle
    detected_at: str
    zone_id: str
    location_name: str
    risk_level: RiskLevel
    confidence_pct: int
    evidence_summary: List[str]
    timer_seconds_remaining: int
    escalated_to: Optional[str] = None
    authority_decision: Optional[Dict[str, Any]] = None

class Route(BaseModel):
    id: str
    name: str
    endpoints: List[str]
    status: RouteStatus
    access_score: int # 0-100
    source: str
    freshness_min: int
    confidence_pct: int
    coordinates: List[List[float]]
    notes: str

class Shelter(BaseModel):
    id: str
    name: str
    zone_id: str
    location: List[float] # [lat, lng]
    capacity: int
    occupancy: int
    safe_margin: int
    medical_need: str
    food_days_remaining: float
    water_liters: int
    doctors_present: int
    status: str

class Resource(BaseModel):
    id: str
    name: str
    kind: str # "RESCUE_TEAM", "RESCUE_BOAT", "MEDICAL_TEAM", "NGO_VOLUNTEERS", "AMBULANCE"
    station_location: str
    current_coords: List[float]
    status: str # "AVAILABLE", "DEPLOYED", "STANDBY"
    assigned_mission_id: Optional[str] = None
    capacity_persons: int

class Drone(BaseModel):
    id: str
    callsign: str
    role: DroneRole
    station_id: str
    location: List[float] # [lat, lng]
    battery_pct: int
    payload_capacity_kg: float
    current_payload_kg: float
    status: DroneStatus
    mesh_status: MeshLinkStatus
    mesh_rssi_dbm: int
    current_mission_id: Optional[str] = None
    last_telemetry_time: str

class Mission(BaseModel):
    id: str
    title: str
    type: MissionType
    priority: str # "URGENT", "HIGH", "MEDIUM"
    target_zone_id: str
    target_coords: List[float]
    assigned_resources: List[str]
    approval_state: MissionApprovalState
    explanation: Dict[str, Any] # { "evidence": "...", "confidence": 88, "urgency": "Severe", "approval_required": True }
    created_at: str
    status_notes: str

class RescueIncident(BaseModel):
    id: str
    title: str
    zone_id: str
    coords: List[float]
    type: str # "STRANDED_RESIDENTS", "ISOLATED_ANIMAL", "BREACH"
    estimated_count: int
    confidence_pct: int
    status: IncidentStatus
    source_drone_id: Optional[str] = None
    video_timestamp: Optional[str] = None
    verified_by: Optional[str] = None

class StockItem(BaseModel):
    id: str
    name: str
    category: str # "FOOD", "WATER", "MEDICINE", "FIRST_AID", "SHELTER"
    quantity: int
    unit: str
    depot_location: str
    min_threshold: int
    status: str # "ADEQUATE", "LOW_STOCK", "CRITICAL_SHORTAGE"

class MutualAidRequest(BaseModel):
    id: str
    item_requested: str
    quantity: int
    unit: str
    urgency: str # "IMMEDIATE", "HIGH", "STANDARD"
    target_location: str
    recommended_source: str
    proposed_route: str
    state: MutualAidState
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    fulfillment_notes: Optional[str] = None

class AuditEvent(BaseModel):
    id: str
    timestamp: str
    source_module: str # "PREDICTION", "ORCHESTRATOR", "AUTHORITY", "E-RESQ", "E-SUPP", "E-SWARM"
    action: str
    details: str
    confidence_pct: Optional[int] = None
    user_id: Optional[str] = None

class SharedSituationModel(BaseModel):
    incident_name: str
    incident_phase: str
    last_updated: str
    active_authority: Optional[str] = None
    is_authenticated: bool = False
    zones: List[Zone]
    alert: Alert
    routes: List[Route]
    shelters: List[Shelter]
    resources: List[Resource]
    drones: List[Drone]
    missions: List[Mission]
    incidents: List[RescueIncident]
    inventory: List[StockItem]
    mutual_aid_requests: List[MutualAidRequest]
    recent_inputs: List[PredictionInput]
    audit_log: List[AuditEvent]
