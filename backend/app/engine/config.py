"""
EODOSS decision core — configuration.

Every weight and threshold lives here so the demo can show a sensitivity sweep
and so a judge can inspect the assumptions instead of guessing them.
"""

# ---------------------------------------------------------------- priority
# "Need" = how badly this zone requires help. Deliberately does NOT include
# uncertainty: mixing the two is what makes rankings unstable and unexplainable.
NEED_WEIGHTS = {
    "exposure": 0.35,   # population_exposed, log-normalised
    "severity": 0.30,   # risk_score / 100
    "trend": 0.15,      # RISING / STABLE / RECEDING
    "isolation": 0.20,  # 1 - route access factor (cut-off => higher need)
}

TREND_FACTOR = {
    "RISING": 1.00,
    "STABLE": 0.60,
    "RECEDING": 0.25,
}

# Route status -> usable fraction of normal travel speed.
ACCESS_FACTOR = {
    "ACCESSIBLE": 1.00,
    "REPLANNED_ALTERNATE": 0.85,
    "CAUTION_WATERLOGGING": 0.60,
    "UNCERTAIN": 0.45,
    "BLOCKED": 0.10,
}

# A route further than this from a zone centre is not considered "the way in".
ROUTE_LINK_MAX_KM = 4.0

# ---------------------------------------------------------------- confidence
# Half-life of an observation, in minutes, per source type.
# This is the decay that makes "freshness" mean something.
HALF_LIFE_MIN = {
    "DRONE_TELEMETRY": 25,
    "FIELD_REPORT": 60,
    "RIVER_SENSOR": 90,
    "WEATHER_RADAR": 180,
    "LISS4_SATELLITE": 720,   # 12 h
    "SATELLITE": 720,
}
DEFAULT_HALF_LIFE_MIN = 240

# How confidence is assembled from evidence-quality signals.
CONFIDENCE_WEIGHTS = {
    "mean_confidence": 0.35,   # average declared confidence of the inputs
    "staleness": 0.25,         # decayed freshness
    "agreement": 0.20,         # 1 - fraction of DISPUTED inputs
    "recency": 0.10,           # has anything observed this zone recently?
    "completeness": 0.10,      # expected metrics that we actually hold
}

EXPECTED_METRICS = ("water_level", "rainfall", "inundation_extent")

CONFIDENCE_FLOOR = 0.05
CONFIDENCE_CEIL = 0.99
NO_EVIDENCE_CONFIDENCE = 0.15

# ---------------------------------------------------------------- recon rule
# Information value = need x (1 - confidence). Recon is proposed for zones whose
# unknown *matters*, not merely for zones that are unknown.
RECON_INFO_VALUE_THRESHOLD = 0.35   # 0..1
RECON_MAX_PROPOSALS = 3
RECON_MIN_BATTERY_PCT = 35
RECON_COOLDOWN_MIN = 20             # don't re-fly a zone observed this recently

# ---------------------------------------------------------------- allocation
# Travel speed (km/h) by resource kind, and how many units one task may take.
RESOURCE_SPEED_KMH = {
    "RESCUE_BOAT": 22,
    "RESCUE_TEAM": 28,
    "MEDICAL_TEAM": 35,
    "AMBULANCE": 40,
    "NGO_VOLUNTEERS": 18,
}
DEFAULT_SPEED_KMH = 25

CAPABILITY = {
    "RESCUE_DISPATCH": ("RESCUE_BOAT", "RESCUE_TEAM"),
    "EVACUATION_ESCORT": ("RESCUE_BOAT", "NGO_VOLUNTEERS"),
    "MEDICAL_DEPLOYMENT": ("MEDICAL_TEAM", "AMBULANCE"),
    "CARGO_DELIVERY": ("NGO_VOLUNTEERS", "RESCUE_TEAM"),
}
MAX_RESOURCES_PER_TASK = 2

# Extra minutes of travel per unit of lost access (straight-line ETA is optimistic).
ROUTE_PENALTY_MULTIPLIER = 1.5

# A depot that is itself cut off has to detour to the nearest usable corridor.
# Modelled as a fixed delay rather than a multiplier, because detours are long
# and roughly distance-independent in a flood plain.
CUTOFF_ACCESS_THRESHOLD = 0.40
CUTOFF_DETOUR_MIN = 25

# Confidence below which a rescue dispatch should be preceded by verification.
VERIFY_FIRST_CONFIDENCE = 0.55

# ---------------------------------------------------------------- display
# Recompute is cheap; the UI polls/pushes the whole state anyway.
DERIVED_VERSION = 3
