import { SharedSituationModel } from '../types/situation';

export const getInitialClientSituation = (): SharedSituationModel => {
  const nowStr = new Date().toISOString();

  return {
    incident_name: "BRAHMAPUTRA FLASH SURGE & URBAN INUNDATION - GUWAHATI METRO",
    incident_phase: "EMERGING_CRISIS_ASSESSMENT",
    last_updated: nowStr,
    active_authority: "Shri R. Baruah, IAS (District Disaster Officer - Officiating)",
    is_authenticated: false,
    zones: [
      {
        id: "ZONE_A",
        name: "Zone A - North Guwahati Bank",
        risk_level: "ELEVATED",
        uncertainty: "LOW",
        risk_score: 68.5,
        population_exposed: 14200,
        water_level_m: 49.8,
        hazard_trend: "RISING",
        latest_evidence: "Brahmaputra northern gauge 0.6m below danger mark, seepage at old riverwall.",
        coordinates: [
          [26.195, 91.715], [26.208, 91.730], [26.212, 91.752],
          [26.204, 91.768], [26.192, 91.760], [26.188, 91.740],
          [26.190, 91.722], [26.195, 91.715]
        ],
        center: [26.200, 91.740]
      },
      {
        id: "ZONE_B",
        name: "Zone B - Bharalumukh & Fancy Bazar Basin",
        risk_level: "SEVERE",
        uncertainty: "MODERATE",
        risk_score: 78.2,
        population_exposed: 28500,
        water_level_m: 50.4,
        hazard_trend: "RISING",
        latest_evidence: "Bharalu river backflow due to high Brahmaputra level; urban drainage locked at sluice gate.",
        coordinates: [
          [26.176, 91.722], [26.185, 91.735], [26.188, 91.750],
          [26.179, 91.758], [26.168, 91.752], [26.164, 91.738],
          [26.168, 91.724], [26.176, 91.722]
        ],
        center: [26.176, 91.740]
      },
      {
        id: "ZONE_C",
        name: "Zone C - Uzan Bazar & Kharghuli Riverfront",
        risk_level: "ELEVATED",
        uncertainty: "LOW",
        risk_score: 62.0,
        population_exposed: 19800,
        water_level_m: 49.2,
        hazard_trend: "STABLE",
        latest_evidence: "Ghat stairs inundated. Embankment holding, normal traffic on arterial road.",
        coordinates: [
          [26.188, 91.755], [26.196, 91.772], [26.200, 91.792],
          [26.190, 91.805], [26.178, 91.796], [26.175, 91.778],
          [26.180, 91.760], [26.188, 91.755]
        ],
        center: [26.187, 91.780]
      },
      {
        id: "ZONE_D",
        name: "Zone D - Pandu Port & Kamakhya Lowlands",
        risk_level: "SEVERE",
        uncertainty: "LOW",
        risk_score: 84.0,
        population_exposed: 31000,
        water_level_m: 51.1,
        hazard_trend: "RISING",
        latest_evidence: "Port warehouse perimeter inundated; jetty 2 submerged under 1.2m current.",
        coordinates: [
          [26.172, 91.675], [26.178, 91.692], [26.175, 91.710],
          [26.166, 91.718], [26.155, 91.712], [26.150, 91.695],
          [26.154, 91.678], [26.163, 91.670], [26.172, 91.675]
        ],
        center: [26.163, 91.695]
      },
      {
        id: "ZONE_E",
        name: "Zone E - Jalukbari & AEC High Ground",
        risk_level: "LOW",
        uncertainty: "LOW",
        risk_score: 18.4,
        population_exposed: 8500,
        water_level_m: 44.1,
        hazard_trend: "STABLE",
        latest_evidence: "High ridge terrain unaffected. Primary logistics staging hub and safe shelter cluster.",
        coordinates: [
          [26.142, 91.655], [26.150, 91.670], [26.146, 91.688],
          [26.135, 91.692], [26.126, 91.678], [26.128, 91.660],
          [26.142, 91.655]
        ],
        center: [26.138, 91.675]
      },
      {
        id: "ZONE_F",
        name: "Zone F - Chandrapur & Eastern Riverbank",
        risk_level: "CRITICAL",
        uncertainty: "HIGH",
        risk_score: 92.6,
        population_exposed: 16400,
        water_level_m: 52.3,
        hazard_trend: "RISING",
        latest_evidence: "Partial earthen dyke breach detected at Chandrapur bend; 14 people reported stranded on school rooftop.",
        coordinates: [
          [26.215, 91.835], [26.222, 91.855], [26.218, 91.880],
          [26.205, 91.892], [26.188, 91.885], [26.178, 91.868],
          [26.174, 91.845], [26.182, 91.828], [26.198, 91.824],
          [26.215, 91.835]
        ],
        center: [26.195, 91.855]
      }
    ],
    alert: {
      id: "ALT-2026-GW-001",
      title: "POTENTIAL FLOOD EVENT DETECTED",
      level: "LEVEL_3_SEVERE",
      lifecycle: "PENDING_LOCAL_REVIEW",
      detected_at: nowStr,
      zone_id: "ZONE_F",
      location_name: "Zone F, Guwahati East (Chandrapur Sector)",
      risk_level: "SEVERE",
      confidence_pct: 88,
      evidence_summary: [
        "CWC River Gauge (Pandu Station): Brahmaputra flowing at 50.85m (+1.12m above Warning Level).",
        "IMD Doppler Radar: Sustained 42mm/hr convective precipitation in upstream catchment (Kamrup Rural).",
        "ISRO LISS-4 Optical Imagery: Multi-temporal overlay shows 340 ha water spread expansion in past 6h.",
        "E-SCOUT Drone 01 Visual Telemetry: Water cresting Chandrapur earthen bund at Lat 26.179, Long 91.824."
      ],
      timer_seconds_remaining: 300,
      escalated_to: null,
      authority_decision: null
    },
    routes: [
      {
        id: "RT-01",
        name: "RT-01 · AT Road (Open)",
        endpoints: ["Jalukbari / AEC Hub", "Pandu Port & Kamakhya Foothills"],
        status: "ACCESSIBLE",
        access_score: 94,
        source: "Traffic Enforcement GIS + Field Patrol",
        freshness_min: 8,
        confidence_pct: 94,
        coordinates: [
          [26.1415, 91.6610], [26.1485, 91.6715], [26.1540, 91.6820],
          [26.1578, 91.6935], [26.1612, 91.7010], [26.1665, 91.7005], [26.1710, 91.6960]
        ],
        notes: "NH-27 / Assam Trunk (AT) Road → Maligaon Chariali → Pandu Port Road. Clear elevated corridor."
      },
      {
        id: "RT-02",
        name: "RT-02 · GS/AT Road (Caution)",
        endpoints: ["GMC Hospital (Bhangagarh)", "Bharalumukh & Fancy Bazar Sluice"],
        status: "CAUTION_WATERLOGGING",
        access_score: 62,
        source: "Municipal CCTV & Traffic Sensors",
        freshness_min: 14,
        confidence_pct: 82,
        coordinates: [
          [26.1545, 91.7685], [26.1620, 91.7630], [26.1695, 91.7565],
          [26.1730, 91.7485], [26.1745, 91.7400], [26.1755, 91.7330]
        ],
        notes: "GS Road → Ulubari Flyover → AT Road → Athgaon → Bharalumukh. Waterlogging 0.25m near sluice."
      },
      {
        id: "RT-03",
        name: "RT-03 · Bund Road (Blocked)",
        endpoints: ["Panbazar / Uzan Bazar", "Chandrapur School Rooftop"],
        status: "BLOCKED",
        access_score: 0,
        source: "E-SCOUT-01 High-Res Video Feed",
        freshness_min: 5,
        confidence_pct: 92,
        coordinates: [
          [26.1865, 91.7480], [26.1905, 91.7590], [26.1935, 91.7710],
          [26.1915, 91.7860], [26.1940, 91.8010], [26.1920, 91.8150],
          [26.1895, 91.8320], [26.1880, 91.8480]
        ],
        notes: "MG Road → Kharghuli — Noonmati — Bonda — Chandrapur Embankment Road. Washed out at KM 4.2."
      },
      {
        id: "RT-04",
        name: "RT-04 · Southern Bypass (Active Replan)",
        endpoints: ["Six Mile Junction", "Chandrapur Approach"],
        status: "REPLANNED_ALTERNATE",
        access_score: 88,
        source: "EODOSS Automated Route Replanning Engine",
        freshness_min: 4,
        confidence_pct: 89,
        coordinates: [
          [26.1460, 91.7890], [26.1390, 91.8040], [26.1435, 91.8210],
          [26.1560, 91.8340], [26.1690, 91.8420], [26.1810, 91.8465], [26.1880, 91.8480]
        ],
        notes: "NH-27 / GS Road → Six Mile → Panjabari → Bonda / Southern High-Ground Approach. Verified safe alternate."
      },
      {
        id: "RT-05",
        name: "RT-05 · Saraighat Corridor (Open)",
        endpoints: ["Jalukbari NH-27 Approach", "North Guwahati Relief Sector"],
        status: "ACCESSIBLE",
        access_score: 96,
        source: "NHAI & Border Roads GIS Telemetry",
        freshness_min: 10,
        confidence_pct: 95,
        coordinates: [
          [26.1520, 91.6680], [26.1625, 91.6710], [26.1755, 91.6732],
          [26.1865, 91.6755], [26.1915, 91.6890], [26.1950, 91.7120], [26.1985, 91.7320]
        ],
        notes: "Jalukbari NH-27 Approach → Saraighat Bridge over Brahmaputra → Amingaon / North Guwahati."
      }
    ],
    shelters: [
      {
        id: "SH-01",
        name: "Jalukbari Higher Secondary Relief Shelter",
        zone_id: "ZONE_E",
        location: [26.143, 91.664],
        capacity: 600,
        occupancy: 320,
        safe_margin: 280,
        medical_need: "Sufficient",
        food_days_remaining: 4.5,
        water_liters: 6800,
        doctors_present: 3,
        status: "OPERATIONAL"
      },
      {
        id: "SH-02",
        name: "Cotton University Community Relief Center",
        zone_id: "ZONE_A",
        location: [26.186, 91.751],
        capacity: 450,
        occupancy: 390,
        safe_margin: 60,
        medical_need: "HIGH - Pediatric ORS & water purifying tablets required",
        food_days_remaining: 1.8,
        water_liters: 2200,
        doctors_present: 1,
        status: "NEAR_CAPACITY"
      },
      {
        id: "SH-03",
        name: "Pandu Port Community Complex",
        zone_id: "ZONE_D",
        location: [26.158, 91.705],
        capacity: 250,
        occupancy: 242,
        safe_margin: 8,
        medical_need: "CRITICAL - First aid dressing and anti-venom replenishment",
        food_days_remaining: 0.9,
        water_liters: 850,
        doctors_present: 1,
        status: "OVERFLOW_RISK"
      },
      {
        id: "SH-04",
        name: "Chandrapur Tea Estate High School",
        zone_id: "ZONE_F",
        location: [26.177, 91.822],
        capacity: 300,
        occupancy: 110,
        safe_margin: 190,
        medical_need: "URGENT - Isolated by floodwaters; aerial medicine drop requested",
        food_days_remaining: 0.6,
        water_liters: 600,
        doctors_present: 0,
        status: "ISOLATED_CRITICAL"
      }
    ],
    resources: [
      {
        id: "RES-NDRF-01",
        name: "NDRF Battalion 1 - Alpha Company",
        kind: "RESCUE_TEAM",
        station_location: "Jalukbari Emergency Transit Camp",
        current_coords: [26.145, 91.666],
        status: "AVAILABLE",
        assigned_mission_id: null,
        capacity_persons: 40
      },
      {
        id: "RES-SDRF-BOAT-03",
        name: "SDRF Motorized Inflatable Boat Unit 03",
        kind: "RESCUE_BOAT",
        station_location: "Pandu Port Slipway",
        current_coords: [26.161, 91.703],
        status: "AVAILABLE",
        assigned_mission_id: null,
        capacity_persons: 12
      },
      {
        id: "RES-ARMY-BOAT-01",
        name: "Army Engineer Assault Boat Bravo",
        kind: "RESCUE_BOAT",
        station_location: "Uzanbazar Ghat",
        current_coords: [26.187, 91.766],
        status: "STANDBY",
        assigned_mission_id: null,
        capacity_persons: 16
      },
      {
        id: "RES-MED-02",
        name: "GMC Trauma Mobile Medical Squad 2",
        kind: "MEDICAL_TEAM",
        station_location: "Guwahati Medical College (Bhangagarh)",
        current_coords: [26.152, 91.770],
        status: "AVAILABLE",
        assigned_mission_id: null,
        capacity_persons: 6
      },
      {
        id: "RES-NGO-REDX",
        name: "Indian Red Cross Relief Team 4",
        kind: "NGO_VOLUNTEERS",
        station_location: "Panbazar Youth Center",
        current_coords: [26.188, 91.748],
        status: "AVAILABLE",
        assigned_mission_id: null,
        capacity_persons: 15
      }
    ],
    drones: [
      {
        id: "DRN-SC-01",
        callsign: "E-SCOUT-01",
        role: "E-SCOUT",
        station_id: "STN-ALPHA-EOC",
        location: [26.184, 91.748],
        battery_pct: 88,
        payload_capacity_kg: 2.5,
        current_payload_kg: 0.8,
        status: "STANDBY",
        mesh_status: "STRONG",
        mesh_rssi_dbm: -62,
        current_mission_id: null,
        last_telemetry_time: nowStr
      },
      {
        id: "DRN-SC-02",
        callsign: "E-SCOUT-02",
        role: "E-SCOUT",
        station_id: "STN-GAMMA-PANDU",
        location: [26.161, 91.703],
        battery_pct: 64,
        payload_capacity_kg: 2.5,
        current_payload_kg: 0.8,
        status: "STANDBY",
        mesh_status: "RELAY",
        mesh_rssi_dbm: -78,
        current_mission_id: null,
        last_telemetry_time: nowStr
      },
      {
        id: "DRN-CG-01",
        callsign: "E-CARGO-01",
        role: "E-CARGO",
        station_id: "STN-ALPHA-EOC",
        location: [26.184, 91.748],
        battery_pct: 94,
        payload_capacity_kg: 15.0,
        current_payload_kg: 8.5,
        status: "STANDBY",
        mesh_status: "STRONG",
        mesh_rssi_dbm: -59,
        current_mission_id: null,
        last_telemetry_time: nowStr
      },
      {
        id: "DRN-CG-02",
        callsign: "E-CARGO-02",
        role: "E-CARGO",
        station_id: "STN-BETA-JALUKBARI",
        location: [26.145, 91.666],
        battery_pct: 79,
        payload_capacity_kg: 15.0,
        current_payload_kg: 12.0,
        status: "STANDBY",
        mesh_status: "STRONG",
        mesh_rssi_dbm: -66,
        current_mission_id: null,
        last_telemetry_time: nowStr
      },
      {
        id: "DRN-SC-03",
        callsign: "E-SCOUT-03 (Mesh Partitioned)",
        role: "E-SCOUT",
        station_id: "STN-CHANDRAPUR-EXT",
        location: [26.181, 91.828],
        battery_pct: 34,
        payload_capacity_kg: 2.5,
        current_payload_kg: 0.8,
        status: "IN_FLIGHT",
        mesh_status: "NO_UPLINK",
        mesh_rssi_dbm: -104,
        current_mission_id: null,
        last_telemetry_time: nowStr
      }
    ],
    missions: [
      {
        id: "MSN-REC-01",
        title: "E-SCOUT High-Res Reconnaissance: Chandrapur Embankment & School Rooftop",
        type: "RECONNAISSANCE",
        priority: "URGENT",
        target_zone_id: "ZONE_F",
        target_coords: [26.179, 91.824],
        assigned_resources: ["DRN-SC-01"],
        approval_state: "AWAITING_APPROVAL",
        explanation: {
          evidence: "LISS-4 satellite anomaly and river gauge spike indicate breach. Aerial visual confirmation required before launching rescue boats.",
          confidence_pct: 88,
          urgency: "Severe",
          approval_required: true,
          risk_mitigation: "Uncrewed drone flight minimizes human rescuer exposure to fast-flowing current."
        },
        created_at: nowStr,
        status_notes: "Flight path pre-calculated; pending Local Authority mission sign-off."
      }
    ],
    incidents: [
      {
        id: "INC-01",
        title: "Stranded Villagers on Primary School Rooftop",
        zone_id: "ZONE_F",
        coords: [26.179, 91.824],
        type: "STRANDED_RESIDENTS",
        estimated_count: 14,
        confidence_pct: 86,
        status: "POSSIBLE_INCIDENT",
        source_drone_id: "DRN-SC-01",
        video_timestamp: nowStr,
        verified_by: null
      },
      {
        id: "INC-02",
        title: "Livestock Trapped on High Sandbar (Char)",
        zone_id: "ZONE_D",
        coords: [26.168, 91.695],
        type: "ISOLATED_ANIMAL",
        estimated_count: 22,
        confidence_pct: 74,
        status: "POSSIBLE_INCIDENT",
        source_drone_id: "DRN-SC-02",
        video_timestamp: nowStr,
        verified_by: null
      }
    ],
    inventory: [
      {
        id: "STK-01",
        name: "Ready-to-Eat Emergency Food Rations (Packets)",
        category: "FOOD",
        quantity: 3400,
        unit: "Packets",
        depot_location: "Jalukbari Central Civil Warehouse",
        min_threshold: 5000,
        status: "LOW_STOCK"
      },
      {
        id: "STK-02",
        name: "Potable Drinking Water Pouches (500ml)",
        category: "WATER",
        quantity: 8200,
        unit: "Pouches",
        depot_location: "Jalukbari Central Civil Warehouse",
        min_threshold: 10000,
        status: "LOW_STOCK"
      },
      {
        id: "STK-03",
        name: "Pediatric & Adult ORS Electrolyte Sachets",
        category: "MEDICINE",
        quantity: 1200,
        unit: "Sachets",
        depot_location: "GMC District Medical Stores",
        min_threshold: 3000,
        status: "CRITICAL_SHORTAGE"
      },
      {
        id: "STK-04",
        name: "Emergency Trauma & Anti-Venom Kits",
        category: "FIRST_AID",
        quantity: 85,
        unit: "Kits",
        depot_location: "GMC District Medical Stores",
        min_threshold: 200,
        status: "CRITICAL_SHORTAGE"
      },
      {
        id: "STK-05",
        name: "Water-Resistant Thermal Blankets",
        category: "SHELTER",
        quantity: 1800,
        unit: "Blankets",
        depot_location: "Panbazar Red Cross Depot",
        min_threshold: 2500,
        status: "ADEQUATE"
      }
    ],
    mutual_aid_requests: [
      {
        id: "REQ-MA-001",
        item_requested: "Emergency Pediatric ORS, Anti-Venom & Water Chlorination Units",
        quantity: 2500,
        unit: "Assorted Units",
        urgency: "IMMEDIATE",
        target_location: "Guwahati EOC / Zone F Staging Post",
        recommended_source: "Tezpur Regional Medical Logistics Depot (165 km via NH-15)",
        proposed_route: "NH-15 South Corridor (Confirmed open & unobstructed)",
        state: "DRAFTED",
        approved_by: null,
        approved_at: null,
        fulfillment_notes: "Drafted automatically by E-SUPP after GMC store inventory breached 40% safety threshold."
      }
    ],
    recent_inputs: [
      {
        id: "INP-01",
        source_type: "RIVER_SENSOR",
        source_id: "CWC-PANDU-GAUGE",
        timestamp: nowStr,
        freshness_min: 4,
        confidence_pct: 99,
        metric_name: "Brahmaputra Water Level",
        reading_value: "50.85 m (Danger Level: 49.68 m)",
        status: "VERIFIED",
        location_desc: "Pandu Hydrological Monitoring Station"
      },
      {
        id: "INP-02",
        source_type: "WEATHER_RADAR",
        source_id: "IMD-DOPPLER-GHY",
        timestamp: nowStr,
        freshness_min: 8,
        confidence_pct: 94,
        metric_name: "Catchment Rainfall Intensity",
        reading_value: "42.5 mm/hr sustained precipitation",
        status: "VERIFIED",
        location_desc: "Kamrup Metropolitan Catchment Arc"
      },
      {
        id: "INP-03",
        source_type: "LISS4_SATELLITE",
        source_id: "ISRO-LISS4-SCENE-2884",
        timestamp: nowStr,
        freshness_min: 32,
        confidence_pct: 88,
        metric_name: "Flood Inundation Polygon Delta",
        reading_value: "+340 hectares expansion in low-lying floodplain",
        status: "VERIFIED",
        location_desc: "Guwahati East / Chandrapur Basin"
      },
      {
        id: "INP-04",
        source_type: "DRONE_TELEMETRY",
        source_id: "E-SCOUT-01-FLIR",
        timestamp: nowStr,
        freshness_min: 2,
        confidence_pct: 92,
        metric_name: "Embankment Crest Overtopping",
        reading_value: "Spill rate ~18 m3/sec at Chandrapur bund bend",
        status: "VERIFIED",
        location_desc: "Zone F Embankment Point 26.179, 91.824"
      }
    ],
    audit_log: [
      {
        id: "AUD-001",
        timestamp: nowStr,
        source_module: "PREDICTION",
        action: "MODEL_INGESTION_COMPLETE",
        details: "Hydrological sensor, IMD radar, and LISS-4 imagery consolidated. Flood likelihood in Zone F escalated to 92.6%.",
        confidence_pct: 92,
        user_id: "SYSTEM"
      },
      {
        id: "AUD-002",
        timestamp: nowStr,
        source_module: "ORCHESTRATOR",
        action: "ALERT_TRIGGERED",
        details: "Alert ALT-2026-GW-001 raised to PENDING_LOCAL_REVIEW. 5-minute countdown clock initiated for Local Authority.",
        confidence_pct: 88,
        user_id: "ORCHESTRATION_ENGINE"
      },
      {
        id: "AUD-003",
        timestamp: nowStr,
        source_module: "E-SUPP",
        action: "SUPPLY_INVENTORY_AUDIT",
        details: "Inventory check detected ORS & Trauma Kits below critical threshold. Mutual aid draft REQ-MA-001 created.",
        confidence_pct: 95,
        user_id: "E_SUPP_PLANNER"
      }
    ]
  };
};

