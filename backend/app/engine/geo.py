"""Small geospatial helpers. Lat/lng in, kilometres out. No shapely required."""
import math

EARTH_R_KM = 6371.0088


def haversine_km(a, b):
    """Great-circle distance in km between [lat, lng] pairs."""
    lat1, lon1 = math.radians(a[0]), math.radians(a[1])
    lat2, lon2 = math.radians(b[0]), math.radians(b[1])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * EARTH_R_KM * math.asin(min(1.0, math.sqrt(h)))


def _local_xy(pt, ref):
    """Project to a local km plane around `ref`. Accurate enough at city scale."""
    km_per_deg_lat = 110.574
    km_per_deg_lng = 111.320 * max(0.15, math.cos(math.radians(ref[0])))
    return ((pt[1] - ref[1]) * km_per_deg_lng, (pt[0] - ref[0]) * km_per_deg_lat)


def point_to_segment_km(p, a, b):
    """Distance from point p to segment a-b, all in [lat, lng]."""
    px, py = _local_xy(p, p)
    ax, ay = _local_xy(a, p)
    bx, by = _local_xy(b, p)
    dx, dy = bx - ax, by - ay
    seg2 = dx * dx + dy * dy
    if seg2 == 0:
        return math.hypot(ax, ay)
    t = max(0.0, min(1.0, -(ax * dx + ay * dy) / seg2))
    return math.hypot(ax + t * dx, ay + t * dy)


def point_to_polyline_km(point, coords):
    """Shortest distance from a point to a polyline (list of [lat, lng])."""
    if not coords:
        return float("inf")
    if len(coords) == 1:
        return haversine_km(point, coords[0])
    return min(
        point_to_segment_km(point, coords[i], coords[i + 1])
        for i in range(len(coords) - 1)
    )


def bearing_ok(a, b):
    """Placeholder hook for future directional route logic."""
    return True
