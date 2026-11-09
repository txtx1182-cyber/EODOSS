import React, { useEffect, useRef, useState } from 'react';
import { SharedSituationModel, Zone, Route } from '../types/situation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TacticalMapProps {
  situation: SharedSituationModel;
  onSelectEntity: (entity: { type: string; data: any }) => void;
  selectedEntity: { type: string; data: any } | null;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  situation,
  onSelectEntity,
  selectedEntity
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const [enrichedGeometries, setEnrichedGeometries] = useState<Record<string, [number, number][]>>({});

  // Initialize Leaflet Cartographic Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered strictly over the Guwahati Corridor
    const map = L.map(mapContainerRef.current, {
      center: [26.172, 91.755],
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Keyless OpenStreetMap Standard - 100% free, reliable, no watermark
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    // Zoom controls at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    layersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Attempt dynamic OSRM geometry enhancement with instant offline fallback
  useEffect(() => {
    let isCancelled = false;

    const enhanceRoutes = async () => {
      for (const route of situation.routes) {
        if (!route.coordinates || route.coordinates.length < 2) continue;
        if (enrichedGeometries[route.id]) continue;

        try {
          // Take start, middle, and end waypoints for OSRM snapping
          const start = route.coordinates[0];
          const end = route.coordinates[route.coordinates.length - 1];
          const mid = route.coordinates[Math.floor(route.coordinates.length / 2)];
          const samplePoints = [start, mid, end];
          const coordStr = samplePoints.map(([lat, lng]) => `${lng},${lat}`).join(';');
          
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 2000);
          
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`, {
            signal: controller.signal
          });
          clearTimeout(timer);

          if (res.ok) {
            const data = await res.json();
            if (data.routes && data.routes[0]?.geometry?.coordinates && !isCancelled) {
              const osrmCoords: [number, number][] = data.routes[0].geometry.coordinates.map(
                ([lng, lat]: [number, number]) => [lat, lng]
              );
              setEnrichedGeometries(prev => ({ ...prev, [route.id]: osrmCoords }));
            }
          }
        } catch {
          // Graceful fallback to exact multi-waypoint road polyline
        }
      }
    };

    enhanceRoutes();

    return () => {
      isCancelled = true;
    };
  }, [situation.routes]);

  // Update dynamic layers whenever situation data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layersGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // -------------------------------------------------------------
    // 1. ORGANIC SHADED FLOODPLAIN POLYGONS (ZONES A - F)
    // -------------------------------------------------------------
    situation.zones.forEach((zone: Zone) => {
      const isSevere = zone.risk_level === 'CRITICAL' || zone.risk_level === 'SEVERE';
      const isCaution = zone.risk_level === 'ELEVATED';

      let fillColor = '#3F7965';
      let strokeColor = '#3F7965';
      let fillOpacity = 0.22;
      let strokeWidth = 1.5;
      let dashArray: string | undefined = undefined;

      let badgeText = 'Safe High Ground';
      let badgeBg = '#EBF3F0';
      let badgeTextColor = '#2B5949';

      if (isSevere) {
        fillColor = '#B83D38';
        strokeColor = '#B83D38';
        fillOpacity = 0.26;
        strokeWidth = 2;
        badgeText = 'Severe Flood';
        badgeBg = '#FBECEB';
        badgeTextColor = '#992B26';
      } else if (isCaution) {
        fillColor = '#C98826';
        strokeColor = '#C98826';
        fillOpacity = 0.22;
        strokeWidth = 1.5;
        dashArray = '4, 4';
        badgeText = 'Caution';
        badgeBg = '#FDF6E9';
        badgeTextColor = '#9A6514';
      }

      // Draw Main Organic Contour
      const polygon = L.polygon(zone.coordinates as [number, number][], {
        color: strokeColor,
        weight: strokeWidth,
        dashArray: dashArray,
        lineJoin: 'round',
        lineCap: 'round',
        fillColor: fillColor,
        fillOpacity: fillOpacity
      });

      polygon.on('click', () => {
        onSelectEntity({ type: 'Zone', data: zone });
      });
      layerGroup.addLayer(polygon);

      // Inner Core Highlight for Severe Inundation (creates natural GIS floodplain depth)
      if (isSevere && zone.coordinates && zone.coordinates.length > 2) {
        const innerCoords = (zone.coordinates as [number, number][]).map(([lat, lng]) => [
          zone.center[0] + (lat - zone.center[0]) * 0.58,
          zone.center[1] + (lng - zone.center[1]) * 0.58
        ] as [number, number]);

        const innerCore = L.polygon(innerCoords, {
          color: '#B83D38',
          weight: 1,
          dashArray: '3, 3',
          lineJoin: 'round',
          fillColor: '#B83D38',
          fillOpacity: 0.40,
          interactive: false
        });
        layerGroup.addLayer(innerCore);
      }

      // Zone Center Marker with Floating Civic Pill Badge
      const zoneShortCode = zone.id.replace('ZONE_', 'Zone ');
      const badgeIcon = L.divIcon({
        className: 'civic-map-badge',
        html: `
          <div style="
            background: #FFFEFA;
            border: 1px solid #DCD7CC;
            border-radius: 6px;
            padding: 3px 8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.08);
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
            cursor: pointer;
            font-family: 'Plus Jakarta Sans', sans-serif;
            transform: translate(-50%, -50%);
          ">
            <span style="font-weight: 700; font-size: 11px; color: #1D252A;">${zoneShortCode}</span>
            <span style="
              background: ${badgeBg};
              color: ${badgeTextColor};
              font-size: 10px;
              font-weight: 600;
              padding: 1px 6px;
              border-radius: 4px;
              border: 1px solid ${strokeColor}40;
            ">${badgeText}</span>
          </div>
        `,
        iconSize: [0, 0]
      });

      const badgeMarker = L.marker([zone.center[0], zone.center[1]], { icon: badgeIcon });
      badgeMarker.on('click', () => {
        onSelectEntity({ type: 'Zone', data: zone });
      });
      layerGroup.addLayer(badgeMarker);
    });

    // -------------------------------------------------------------
    // 2. REAL MULTI-WAYPOINT GUWAHATI ROAD ROUTES (2-LAYER POLYLINES)
    // -------------------------------------------------------------
    situation.routes.forEach((route: Route) => {
      const routeCoords = enrichedGeometries[route.id] || (route.coordinates as [number, number][]);
      if (!routeCoords || routeCoords.length < 2) return;

      let topColor = '#2E7D32'; // ACCESSIBLE Forest Green
      let topWeight = 4;
      let dashArray: string | undefined = undefined;
      let pillBg = '#EBF3F0';
      let pillBorder = '#2E7D32';
      let pillTextColor = '#1E5A24';
      let pillLabel = route.name;

      if (route.status === 'BLOCKED') {
        topColor = '#B83D38';
        topWeight = 4;
        dashArray = '8, 8';
        pillBg = '#FBECEB';
        pillBorder = '#B83D38';
        pillTextColor = '#992B26';
        pillLabel = route.id === 'RT-03' ? '⛔ ROAD WASHED OUT - RT-03' : `${route.name} (Blocked)`;
      } else if (route.status === 'CAUTION_WATERLOGGING' || route.status === 'UNCERTAIN') {
        topColor = '#D97706'; // Ochre Amber
        topWeight = 4;
        dashArray = '6, 6';
        pillBg = '#FDF6E9';
        pillBorder = '#D97706';
        pillTextColor = '#9A6514';
      } else if (route.status === 'REPLANNED_ALTERNATE') {
        topColor = '#2458A6'; // Official Government Blue
        topWeight = 4.5;
        pillBg = '#EBF2FB';
        pillBorder = '#2458A6';
        pillTextColor = '#1B4584';
      }

      // Layer 1: Wider Road Casing (Wider light-cream line underneath for high visibility)
      const casingPolyline = L.polyline(routeCoords, {
        color: '#FFFEFA',
        weight: 7,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false
      });
      layerGroup.addLayer(casingPolyline);

      // Layer 2: Semantic Colored Road Route
      const routePolyline = L.polyline(routeCoords, {
        color: topColor,
        weight: topWeight,
        dashArray: dashArray,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      });

      routePolyline.on('click', () => {
        onSelectEntity({ type: 'Route', data: route });
      });
      layerGroup.addLayer(routePolyline);

      // Interactive Route Callout Pill at strategic waypoint along the road
      const calloutIdx = route.id === 'RT-03'
        ? 5 // Lat 26.1920, Long 91.8150 (exact washed out wash point)
        : Math.floor(routeCoords.length / 2);
      
      const calloutPos = routeCoords[calloutIdx] || routeCoords[0];

      const calloutIcon = L.divIcon({
        className: 'route-callout-pill',
        html: `
          <div style="
            background: ${pillBg};
            border: 1.5px solid ${pillBorder};
            color: ${pillTextColor};
            border-radius: 5px;
            padding: 2px 7px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.12);
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 10px;
            font-weight: 700;
            white-space: nowrap;
            cursor: pointer;
            transform: translate(-50%, -120%);
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span>${pillLabel}</span>
            <span style="font-size: 9px; opacity: 0.85; font-family: 'JetBrains Mono', monospace;">${route.confidence_pct}%</span>
          </div>
        `,
        iconSize: [0, 0]
      });

      const calloutMarker = L.marker([calloutPos[0], calloutPos[1]], { icon: calloutIcon });
      calloutMarker.on('click', () => {
        onSelectEntity({ type: 'Route', data: route });
      });
      layerGroup.addLayer(calloutMarker);
    });

    // -------------------------------------------------------------
    // 3. AERIAL DRONE FLIGHT PATHS (DISTINCT DOTTED VECTORS)
    // -------------------------------------------------------------
    situation.drones.forEach(drone => {
      const isScout = drone.role === 'E-SCOUT';
      const droneColor = isScout ? '#0284C7' : '#EA580C';

      // Draw thin dotted aerial trajectory to mission target / hub
      if ((drone.status === 'IN_FLIGHT' || drone.status === 'MISSION_ACTIVE' || drone.current_mission_id) && situation.incidents.length > 0) {
        const targetCoord = situation.incidents[0].coords;
        const flightLine = L.polyline([drone.location, targetCoord], {
          color: droneColor,
          weight: 1.5,
          dashArray: '3, 6',
          opacity: 0.65,
          interactive: false
        });
        layerGroup.addLayer(flightLine);
      }

      // Drone Marker
      const droneIcon = L.divIcon({
        className: 'drone-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 5px;
            background: #FFFEFA;
            border: 1px solid #DCD7CC;
            padding: 3px 6px;
            border-radius: 4px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.12);
            cursor: pointer;
            font-family: 'Plus Jakarta Sans', sans-serif;
            white-space: nowrap;
            transform: translate(-50%, -50%);
          ">
            <div style="
              width: 9px;
              height: 9px;
              background: ${droneColor};
              ${isScout ? 'transform: rotate(45deg);' : 'border-radius: 50%;'}
            "></div>
            <span style="font-size: 10px; font-weight: 700; color: #1D252A;">${drone.callsign.split(' ')[0]}</span>
            <span style="font-size: 9px; font-family: 'JetBrains Mono', monospace; color: #5A656E;">${drone.battery_pct}%</span>
          </div>
        `,
        iconSize: [0, 0]
      });

      const marker = L.marker([drone.location[0], drone.location[1]], { icon: droneIcon });
      marker.on('click', () => {
        onSelectEntity({ type: 'Drone', data: drone });
      });
      layerGroup.addLayer(marker);
    });

    // -------------------------------------------------------------
    // 4. RELIEF SHELTERS (CIRCULAR HIGH-CAPACITY NODES)
    // -------------------------------------------------------------
    situation.shelters.forEach(shelter => {
      const occPercent = Math.round((shelter.occupancy / shelter.capacity) * 100);
      let ringColor = '#3F7965';
      if (occPercent > 90) ringColor = '#B83D38';
      else if (occPercent > 70) ringColor = '#C98826';

      const shelterIcon = L.divIcon({
        className: 'shelter-marker',
        html: `
          <div style="
            background: #FFFEFA;
            border: 2px solid ${ringColor};
            border-radius: 50%;
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.15);
            cursor: pointer;
            transform: translate(-50%, -50%);
          ">
            <span style="font-size: 10px; font-weight: 700; color: #1D252A; font-family: 'Plus Jakarta Sans', sans-serif;">S</span>
          </div>
        `,
        iconSize: [0, 0]
      });

      const marker = L.marker([shelter.location[0], shelter.location[1]], { icon: shelterIcon });
      marker.on('click', () => {
        onSelectEntity({ type: 'Shelter', data: shelter });
      });
      layerGroup.addLayer(marker);
    });

    // -------------------------------------------------------------
    // 5. INCIDENT TARGETS (BEACON PULSE & NON-OVERLAPPING OFFSET)
    // -------------------------------------------------------------
    situation.incidents.forEach(inc => {
      const isVerified = inc.status === 'VERIFIED_TARGET';

      const incidentIcon = L.divIcon({
        className: 'incident-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            gap: 6px;
            background: #FFFEFA;
            border: 1.5px solid #B83D38;
            padding: 4px 9px;
            border-radius: 6px;
            box-shadow: 0 3px 10px rgba(184, 61, 56, 0.25);
            cursor: pointer;
            font-family: 'Plus Jakarta Sans', sans-serif;
            white-space: nowrap;
            transform: translate(-50%, -100%);
          ">
            <span style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #B83D38;
              display: inline-block;
            " class="beacon-pulse"></span>
            <span style="font-size: 11px; font-weight: 700; color: #992B26;">
              ${inc.estimated_count} Stranded ${isVerified ? '(Verified)' : '(Target)'}
            </span>
          </div>
        `,
        iconSize: [0, 0]
      });

      const marker = L.marker([inc.coords[0], inc.coords[1]], { icon: incidentIcon });
      marker.on('click', () => {
        onSelectEntity({ type: 'Incident', data: inc });
      });
      layerGroup.addLayer(marker);
    });
  }, [situation, enrichedGeometries, onSelectEntity]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Real Cartographic Map Div */}
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%', backgroundColor: '#D7DFD4' }}
      />

      {/* Crisp White Cartographic & Routing Legend Card */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: '#FFFEFA',
        border: '1px solid #DCD7CC',
        borderRadius: 6,
        padding: '10px 14px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        zIndex: 20,
        fontFamily: 'var(--font-heading)',
        minWidth: 200,
        maxWidth: 240
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#1D252A',
          borderBottom: '1px solid #DCD7CC',
          paddingBottom: 4,
          marginBottom: 8,
          letterSpacing: '0.02em',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Cartographic Legend</span>
          <span style={{ fontSize: 9.5, fontWeight: 500, color: '#5A656E' }}>Guwahati</span>
        </div>

        {/* Section 1: Shaded Flood Areas */}
        <div style={{ fontSize: 10, fontWeight: 700, color: '#5A656E', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Flood Inundation Areas
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11, color: '#1D252A', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 12, height: 12, backgroundColor: 'rgba(184, 61, 56, 0.32)', border: '1.5px solid #B83D38', borderRadius: 2 }} />
            <span>Severe Inundation</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 12, height: 12, backgroundColor: 'rgba(201, 136, 38, 0.28)', border: '1.5px dashed #C98826', borderRadius: 2 }} />
            <span>Caution Zone</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 12, height: 12, backgroundColor: 'rgba(63, 121, 101, 0.25)', border: '1.5px solid #3F7965', borderRadius: 2 }} />
            <span>Safe High Ground</span>
          </div>
        </div>

        {/* Section 2: Road Route Statuses */}
        <div style={{ fontSize: 10, fontWeight: 700, color: '#5A656E', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Road Network Status
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11, color: '#1D252A', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, height: 4, backgroundColor: '#2E7D32', borderRadius: 2, display: 'inline-block' }} />
            <span>Verified Open Road</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, height: 4, borderTop: '2px dashed #D97706', display: 'inline-block' }} />
            <span>Caution / Waterlogged</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, height: 4, borderTop: '2.5px dashed #B83D38', display: 'inline-block' }} />
            <span>Blocked / Washed Out</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, height: 4, backgroundColor: '#2458A6', borderRadius: 2, display: 'inline-block' }} />
            <span>Replanned Alternate</span>
          </div>
        </div>

        {/* Section 3: Aerial Operations */}
        <div style={{ fontSize: 10, fontWeight: 700, color: '#5A656E', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Aerial Operations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11, color: '#1D252A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, transform: 'rotate(45deg)', backgroundColor: '#0284C7', display: 'inline-block' }} />
            <span>E-SCOUT Aerial Recon</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EA580C', display: 'inline-block' }} />
            <span>E-CARGO Relief Corridor</span>
          </div>
        </div>
      </div>
    </div>
  );
};
