"""
Ingestion adapters.

Exactly one feed is live. Everything else is declared and visible as
not_configured, because pretending to have five feeds is how demos lose
credibility under one question.
"""
import json
import urllib.request
from datetime import datetime, timezone

OPEN_METEO = (
    "https://api.open-meteo.com/v1/forecast"
    "?latitude={lat}&longitude={lng}&hourly=precipitation&forecast_days=1"
)

FEEDS = {
    "open_meteo": {"status": "live", "kind": "WEATHER_RADAR",
                   "label": "Open-Meteo hourly precipitation"},
    "cwc_gauge": {"status": "archived", "kind": "RIVER_SENSOR",
                  "label": "CWC Pandu gauge (archived bulletin)"},
    "sentinel1": {"status": "not_configured", "kind": "SATELLITE",
                  "label": "Sentinel-1 SAR"},
    "sentinel2": {"status": "not_configured", "kind": "SATELLITE",
                  "label": "Sentinel-2 optical"},
    "glofas": {"status": "not_configured", "kind": "MODEL",
               "label": "GloFAS river forecast"},
    "imd": {"status": "not_configured", "kind": "WEATHER_RADAR",
            "label": "IMD Doppler radar"},
    "bhuvan": {"status": "not_configured", "kind": "SATELLITE",
               "label": "ISRO Bhuvan flood layers"},
}


def _nearest_zone(zones, lat: float, lng: float):
    best, best_d = None, float("inf")
    for z in zones:
        c = getattr(z, "center", None) or [0, 0]
        d = (c[0] - lat) ** 2 + (c[1] - lng) ** 2
        if d < best_d:
            best, best_d = z, d
    return best


def fetch_open_meteo(zones, lat: float = 26.17, lng: float = 91.75, timeout: int = 5):
    """
    Returns a PredictionInput-shaped dict, or None. Never raises: a live demo
    must survive a dead network more gracefully than a stack trace.
    """
    try:
        req = urllib.request.Request(
            OPEN_METEO.format(lat=lat, lng=lng),
            headers={"User-Agent": "EODOSS/2.0 (hackathon prototype)"},
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            payload = json.loads(resp.read().decode("utf-8"))

        hourly = payload.get("hourly") or {}
        series = hourly.get("precipitation") or []
        values = [v for v in series if isinstance(v, (int, float))]
        if not values:
            return None

        zone = _nearest_zone(zones, lat, lng)
        now = datetime.now(timezone.utc)
        return {
            "id": f"INP-LIVE-{now.strftime('%H%M%S')}",
            "zone_id": getattr(zone, "id", None),
            "source_type": "WEATHER_RADAR",
            "source_id": "open-meteo",
            "timestamp": now.isoformat(),
            "freshness_min": 0,
            "confidence_pct": 85,
            "metric_name": "rainfall",
            "reading_value": f"{values[0]:.1f} mm/h (next hour, hourly series)",
            "status": "UNVERIFIED",
            "location_desc": f"{getattr(zone, 'id', 'Guwahati')} — Open-Meteo grid cell",
        }
    except Exception:
        return None
