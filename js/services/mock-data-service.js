/**
 * AapadaSathi Mock Data Service
 * Comprehensive, localized mock data matching the future FastAPI backend schema.
 * Focus Region: Brahmaputra River Basin (Majuli Island & surrounding riverine wards).
 */

export const MOCK_SETTLEMENTS = [
  {
    id: "settlement-01",
    name: "Mikirpara Settlement",
    district: "Majuli",
    state: "Assam",
    latitude: 26.9650,
    longitude: 94.1820,
    population: 3420,
    riskScore: 89,
    riskLevel: "CRITICAL",
    hazardType: "FLOOD",
    confidence: "91%",
    leadTimeHours: 6.5,
    updatedAt: "12 mins ago",
    evacuationRequired: true,
    routeAvailable: true
  },
  {
    id: "settlement-02",
    name: "Kamalabari Ghat Village",
    district: "Majuli",
    state: "Assam",
    latitude: 26.9400,
    longitude: 94.1600,
    population: 5180,
    riskScore: 74,
    riskLevel: "HIGH",
    hazardType: "FLOOD & EROSION",
    confidence: "88%",
    leadTimeHours: 9.0,
    updatedAt: "18 mins ago",
    evacuationRequired: true,
    routeAvailable: true
  },
  {
    id: "settlement-03",
    name: "Garamur Central Ward",
    district: "Majuli",
    state: "Assam",
    latitude: 26.9850,
    longitude: 94.2300,
    population: 8950,
    riskScore: 48,
    riskLevel: "MODERATE",
    hazardType: "WATERLOGGING",
    confidence: "84%",
    leadTimeHours: 18.0,
    updatedAt: "25 mins ago",
    evacuationRequired: false,
    routeAvailable: false
  },
  {
    id: "settlement-04",
    name: "Jengraimukh Highlands",
    district: "Majuli",
    state: "Assam",
    latitude: 27.0250,
    longitude: 94.2700,
    population: 4300,
    riskScore: 18,
    riskLevel: "LOW",
    hazardType: "HEAVY_RAIN",
    confidence: "94%",
    leadTimeHours: 24.0,
    updatedAt: "30 mins ago",
    evacuationRequired: false,
    routeAvailable: false
  },
  {
    id: "settlement-05",
    name: "Salmora Riverside Ward",
    district: "Majuli",
    state: "Assam",
    latitude: 26.9200,
    longitude: 94.2900,
    population: 2780,
    riskScore: 92,
    riskLevel: "CRITICAL",
    hazardType: "EMBANKMENT_BREACH",
    confidence: "93%",
    leadTimeHours: 4.0,
    updatedAt: "8 mins ago",
    evacuationRequired: true,
    routeAvailable: true
  }
];

export const MOCK_RISK_DETAILS = {
  "settlement-01": {
    settlement: {
      id: "settlement-01",
      name: "Mikirpara Settlement",
      district: "Majuli",
      state: "Assam",
      coordinates: [26.9650, 94.1820]
    },
    hazard: "Flash Riverine Flooding",
    hazardType: "FLOOD",
    riskScore: 89,
    riskLevel: "CRITICAL",
    confidence: "91%",
    leadTimeHours: 6.5,
    explanation: "Critical flood surge projected in ~6.5 hours due to persistent monsoon precipitation upstream, rapid discharge from Ranganadi dam, and breached south embankment.",
    factors: [
      {
        id: "f1",
        name: "Rainfall Intensity",
        icon: "fa-cloud-showers-heavy",
        value: "142 mm",
        unit: "past 24h",
        normal: "32 mm",
        trend: "+340% (Severe)",
        status: "danger",
        explanation: "Continuous high-intensity rainfall exceeding local drainage absorption capacity."
      },
      {
        id: "f2",
        name: "River Discharge",
        icon: "fa-water",
        value: "4,820 m³/s",
        unit: "flow rate",
        normal: "2,100 m³/s",
        trend: "Rising (18cm/h)",
        status: "danger",
        explanation: "Brahmaputra gauge at Nematighat stands 1.45m above danger level."
      },
      {
        id: "f3",
        name: "Soil Moisture",
        icon: "fa-mountain",
        value: "94%",
        unit: "saturation",
        normal: "55%",
        trend: "Near Saturation",
        status: "danger",
        explanation: "Zero runoff infiltration remaining; 100% surface pooling active."
      },
      {
        id: "f4",
        name: "Upstream Inflow",
        icon: "fa-arrow-trend-up",
        value: "Emergency Sluice Open",
        unit: "Ranganadi Hydro",
        normal: "Regulated",
        trend: "Active Discharge",
        status: "warning",
        explanation: "Reservoir reached 99.2% full reservoir level at 14:00 hrs."
      },
      {
        id: "f5",
        name: "Sentinel-1 SAR",
        icon: "fa-satellite",
        value: "Inundation Extent +38%",
        unit: "Satellite Layer",
        normal: "Basin Baseline",
        trend: "Expanding East",
        status: "danger",
        explanation: "Radar backscatter confirms newly submerged lowlands in Ward 4."
      },
      {
        id: "f6",
        name: "Ground LoRa Gauges",
        icon: "fa-tower-broadcast",
        value: "4 of 4 Online",
        unit: "Settlement Array",
        normal: "Healthy",
        trend: "High Accuracy",
        status: "safe",
        explanation: "Telemetry verified with <2s latency; reliable hydrological reading."
      }
    ],
    impact: {
      peopleAffected: 3420,
      structuresAffected: 715,
      roadsAffectedKm: 4.8,
      priorityLevel: "P1 - IMMEDIATE EVACUATION",
      affectedAreaKm2: 8.4,
      estimateType: "AI-Hydro Ensemble Prototype Forecast"
    },
    recommendedAction: "Evacuate immediately to Model Higher Secondary Cyclone & Flood Shelter via the designated North Embankment corridor. Do not cross low-lying culverts.",
    evacuationRequired: true,
    routeAvailable: true,
    timeline: [
      { time: "06:30 AM", title: "Heavy Inflow Detected", desc: "Upstream radar detected convective storm cluster over catchment area." },
      { time: "11:15 AM", title: "Embankment Seepage Alert", desc: "LoRa sensor #04 registered pore pressure surge along Sector 3." },
      { time: "02:40 PM", title: "Risk Escalated to CRITICAL", desc: "AI-fusion model projected flood crest reaching Mikirpara in 6.5 hours." },
      { time: "03:10 PM", title: "Evacuation Protocol Activated", desc: "Clear evacuation corridor and shelter mobilization confirmed." }
    ],
    confidenceMeta: {
      availableSources: ["IMD Doppler Radar", "CWC Gauge Nematighat", "Sentinel-1 SAR Extent", "Majuli LoRa Array"],
      unavailableSources: ["UAV Drone Orthomosaic (Cloud cover)"],
      modelStatus: "Live Simulated Ensemble (v2.4 Prototype)",
      nextUpdateExpected: "In 18 minutes (Auto-sync)"
    },
    updatedAt: "12 mins ago"
  },
  "settlement-02": {
    settlement: {
      id: "settlement-02",
      name: "Kamalabari Ghat Village",
      district: "Majuli",
      state: "Assam",
      coordinates: [26.9400, 94.1600]
    },
    hazard: "Riverbank Erosion & High Water",
    hazardType: "FLOOD & EROSION",
    riskScore: 74,
    riskLevel: "HIGH",
    confidence: "88%",
    leadTimeHours: 9.0,
    explanation: "High riverbank erosion velocity (1.8m/day) threatens waterfront houses. High water surge anticipated within 9 hours.",
    factors: [
      { id: "f1", name: "Bank Erosion Rate", icon: "fa-water", value: "1.8 m/day", unit: "scour speed", normal: "0.2 m/day", trend: "+900%", status: "danger", explanation: "Eddy currents destabilizing loose alluvial banks." },
      { id: "f2", name: "Rainfall", icon: "fa-cloud-rain", value: "98 mm", unit: "past 24h", normal: "30 mm", trend: "+226%", status: "warning", explanation: "Continuous moderate to heavy rain." },
      { id: "f3", name: "Ferry Transit", icon: "fa-ship", value: "Suspended", unit: "Inland Water", normal: "Operational", trend: "Alert", status: "danger", explanation: "Navigational currents unsafe for small vessels." }
    ],
    impact: {
      peopleAffected: 5180,
      structuresAffected: 980,
      roadsAffectedKm: 6.2,
      priorityLevel: "P2 - HIGH PRIORITY",
      affectedAreaKm2: 12.1,
      estimateType: "AI-Hydro Ensemble Prototype Forecast"
    },
    recommendedAction: "Relocate vulnerable households away from the waterfront. Prepare go-bags and move livestock inland.",
    evacuationRequired: true,
    routeAvailable: true,
    timeline: [
      { time: "08:00 AM", title: "Ferry Services Halted", desc: "Inland water authority stopped river crossings due to turbid currents." },
      { time: "01:00 PM", title: "Bank Shear Failure", desc: "15 meters of unreinforced riverbank sheared into Brahmaputra." }
    ],
    confidenceMeta: {
      availableSources: ["IMD Radar", "CWC Gauges", "Satellite Multispectral"],
      unavailableSources: ["LoRa Acoustic Sensors"],
      modelStatus: "Simulated Ensemble",
      nextUpdateExpected: "In 25 minutes"
    },
    updatedAt: "18 mins ago"
  },
  "settlement-03": {
    settlement: {
      id: "settlement-03",
      name: "Garamur Central Ward",
      district: "Majuli",
      state: "Assam",
      coordinates: [26.9850, 94.2300]
    },
    hazard: "Localized Urban Waterlogging",
    hazardType: "WATERLOGGING",
    riskScore: 48,
    riskLevel: "MODERATE",
    confidence: "84%",
    leadTimeHours: 18.0,
    explanation: "Moderate street pooling in low depressions. Main roads remain passable. Continue monitoring.",
    factors: [
      { id: "f1", name: "Surface Ponding", icon: "fa-water", value: "0.3 m", unit: "average depth", normal: "0.0 m", trend: "Stable", status: "warning", explanation: "Natural depression water accumulation." },
      { id: "f2", name: "Drainage Outflow", icon: "fa-arrow-down", value: "65% Capacity", unit: "pump station", normal: "80%", trend: "Clear", status: "safe", explanation: "Emergency municipal pumps operating normally." }
    ],
    impact: {
      peopleAffected: 1200,
      structuresAffected: 140,
      roadsAffectedKm: 1.5,
      priorityLevel: "P3 - MONITORING",
      affectedAreaKm2: 2.3,
      estimateType: "Prototype Forecast"
    },
    recommendedAction: "Elevate ground-floor electrical equipment. Clear roadside trash to avoid drain blockage.",
    evacuationRequired: false,
    routeAvailable: false,
    timeline: [
      { time: "10:00 AM", title: "Drainage Advisory Issued", desc: "Municipal team stationed pumps at hospital road." }
    ],
    confidenceMeta: {
      availableSources: ["Municipal Telemetry", "IMD Rainfall"],
      unavailableSources: ["Satellite (Too high resolution for small ponds)"],
      modelStatus: "Operational Run",
      nextUpdateExpected: "In 40 minutes"
    },
    updatedAt: "25 mins ago"
  },
  "settlement-04": {
    settlement: {
      id: "settlement-04",
      name: "Jengraimukh Highlands",
      district: "Majuli",
      state: "Assam",
      coordinates: [27.0250, 94.2700]
    },
    hazard: "Light Seasonal Precipitation",
    hazardType: "HEAVY_RAIN",
    riskScore: 18,
    riskLevel: "LOW",
    confidence: "94%",
    leadTimeHours: 24.0,
    explanation: "Area is elevated +16m above flood datum. No immediate risk of inundation. Designated as safe refuge hub.",
    factors: [
      { id: "f1", name: "Elevation", icon: "fa-mountain-sun", value: "+16 m", unit: "above datum", normal: "+16 m", trend: "High Ground", status: "safe", explanation: "Natural plateau naturally resilient to river crests." }
    ],
    impact: {
      peopleAffected: 0,
      structuresAffected: 0,
      roadsAffectedKm: 0,
      priorityLevel: "SAFE REFUGE HUB",
      affectedAreaKm2: 0,
      estimateType: "Prototype Estimate"
    },
    recommendedAction: "No evacuation needed. Shelters are open to receive families arriving from lower riverine wards.",
    evacuationRequired: false,
    routeAvailable: false,
    timeline: [
      { time: "07:00 AM", title: "Shelter Operations Readiness", desc: "Primary relief stockpiles verified and staffed." }
    ],
    confidenceMeta: {
      availableSources: ["Full Telemetry Suite"],
      unavailableSources: [],
      modelStatus: "Operational Run",
      nextUpdateExpected: "In 1 hour"
    },
    updatedAt: "30 mins ago"
  },
  "settlement-05": {
    settlement: {
      id: "settlement-05",
      name: "Salmora Riverside Ward",
      district: "Majuli",
      state: "Assam",
      coordinates: [26.9200, 94.2900]
    },
    hazard: "Embankment Breach & Surge",
    hazardType: "EMBANKMENT_BREACH",
    riskScore: 92,
    riskLevel: "CRITICAL",
    confidence: "93%",
    leadTimeHours: 4.0,
    explanation: "High-speed water breach at Spur #4. Water approaching residential cluster within 4 hours. Immediate evacuation mandatory.",
    factors: [
      { id: "f1", name: "Breach Width", icon: "fa-triangle-exclamation", value: "32 meters", unit: "embankment gap", normal: "0 m", trend: "Widening", status: "danger", explanation: "Geotextile tubes gave way under hydraulic pressure." },
      { id: "f2", name: "Flow Velocity", icon: "fa-gauge-high", value: "3.4 m/s", unit: "water velocity", normal: "0.8 m/s", trend: "Rapid", status: "danger", explanation: "High kinetic force capable of sweeping light vehicles." }
    ],
    impact: {
      peopleAffected: 2780,
      structuresAffected: 540,
      roadsAffectedKm: 5.1,
      priorityLevel: "P1 - CRITICAL RESCUE",
      affectedAreaKm2: 7.2,
      estimateType: "AI-Hydro Ensemble Prototype Forecast"
    },
    recommendedAction: "Move immediately toward Kamalabari Higher Ground. Avoid riverside track. Follow SDRF boat teams.",
    evacuationRequired: true,
    routeAvailable: true,
    timeline: [
      { time: "01:30 PM", title: "Initial Structural Crack", desc: "Patrol reported 10m longitudinal crack in bund." },
      { time: "03:00 PM", title: "Breach Confirmed", desc: "32m segment failed; emergency sirens sounded." }
    ],
    confidenceMeta: {
      availableSources: ["Field Patrol Telemetry", "Drone Footage", "River Gauges"],
      unavailableSources: [],
      modelStatus: "Emergency Inundation Run",
      nextUpdateExpected: "In 10 minutes"
    },
    updatedAt: "8 mins ago"
  }
};

export const MOCK_ALERTS = [
  {
    id: "alert-001",
    settlementId: "settlement-01",
    settlementName: "Mikirpara Settlement",
    hazardType: "FLOOD",
    severity: "CRITICAL",
    title: "Critical Flash Flood Warning - Evacuate to Model School Shelter",
    message: "Water level is expected to cross safety bunds in approximately 6.5 hours. Follow the verified North Embankment corridor.",
    issuedAt: "Today, 02:40 PM",
    expectedImpactAt: "Today, 09:10 PM",
    leadTimeHours: 6.5,
    recommendedAction: "Evacuate immediately via North Corridor to Model Higher Secondary Shelter.",
    confidence: "91%",
    evacuationRequired: true,
    routeAvailable: true
  },
  {
    id: "alert-002",
    settlementId: "settlement-05",
    settlementName: "Salmora Riverside Ward",
    hazardType: "EMBANKMENT_BREACH",
    severity: "CRITICAL",
    title: "Embankment Breach at Spur #4 - Rapid Inundation",
    message: "A 32m breach in the flood protection bund has allowed floodwaters into agricultural lands. Estimated lead time is 4.0 hours.",
    issuedAt: "Today, 03:00 PM",
    expectedImpactAt: "Today, 07:00 PM",
    leadTimeHours: 4.0,
    recommendedAction: "Head east to Kamalabari High Ground immediately.",
    confidence: "93%",
    evacuationRequired: true,
    routeAvailable: true
  },
  {
    id: "alert-003",
    settlementId: "settlement-02",
    settlementName: "Kamalabari Ghat Village",
    hazardType: "FLOOD & EROSION",
    severity: "HIGH",
    title: "Severe Riverbank Erosion & Water Surge Warning",
    message: "Riverbank scours advancing at 1.8m/day. Upstream discharge will cause localized inundation within 9 hours.",
    issuedAt: "Today, 01:15 PM",
    expectedImpactAt: "Today, 10:15 PM",
    leadTimeHours: 9.0,
    recommendedAction: "Move away from riverfront structures; prepare family for planned evacuation.",
    confidence: "88%",
    evacuationRequired: true,
    routeAvailable: true
  },
  {
    id: "alert-004",
    settlementId: "settlement-03",
    settlementName: "Garamur Central Ward",
    hazardType: "WATERLOGGING",
    severity: "MODERATE",
    title: "Drainage Advisory - Moderate Road Ponding",
    message: "Continuous precipitation causing localized ponding on secondary roadways. Major arteries remain clear.",
    issuedAt: "Today, 12:00 PM",
    expectedImpactAt: "Tomorrow, 06:00 AM",
    leadTimeHours: 18.0,
    recommendedAction: "Avoid driving small vehicles through submerged depressions.",
    confidence: "84%",
    evacuationRequired: false,
    routeAvailable: false
  }
];

export const MOCK_SAFE_ROUTE = {
  settlementId: "settlement-01",
  settlementName: "Mikirpara Settlement",
  currentRisk: "CRITICAL (Score: 89)",
  shelterId: "shelter-01",
  shelterName: "Model Higher Secondary & Multi-Purpose Flood Shelter",
  shelterCoordinates: [26.9940, 94.2250],
  distanceKm: 4.2,
  estimatedMinutesFoot: 50,
  estimatedMinutesVehicle: 12,
  routeStatus: "VERIFIED_SAFE",
  safetyNotes: "North Embankment corridor is reinforced and 3.5m above current water crest.",
  lastVerifiedAt: "15 minutes ago by SDRF Field Unit 2",
  instructions: [
    {
      step: 1,
      title: "Depart Mikirpara Ward 4 Northward",
      detail: "Head north along the main village road toward the elevated PWD embankment. Do not venture south toward the riverbanks.",
      type: "start"
    },
    {
      step: 2,
      title: "Join North Embankment Paved Corridor",
      detail: "Turn right onto the high-ground paved embankment (Route NH-715A Spur). Road surface is intact with solar floodlights active.",
      type: "corridor"
    },
    {
      step: 3,
      title: "CAUTION: Avoid South Culvert Bypass (Km 3.2)",
      detail: "The southern low-level culvert has washed out. Strictly stay on the upper paved ridge as directed by SDRF yellow cones.",
      type: "avoid"
    },
    {
      step: 4,
      title: "Pass Medical Triage Checkpoint (Km 2.8)",
      detail: "Volunteers from District Disaster Management Authority (DDMA) are stationed with drinking water and first aid.",
      type: "waypoint"
    },
    {
      step: 5,
      title: "Arrive at Model Higher Secondary Safe Shelter",
      detail: "Enter via Gate 1. Registration desk, hot meals, drinking water, and generator-backed sanitation are operational.",
      type: "destination"
    }
  ],
  shelterDetails: {
    name: "Model Higher Secondary & Multi-Purpose Flood Shelter",
    capacity: 1800,
    occupancyCurrent: 580,
    occupancyStatus: "32% Occupied - Ample Space Available",
    elevation: "+14m above river datum (High Ground)",
    amenities: [
      "Drinking Water Purification Unit",
      "Medical Post & Basic Trauma Care",
      "24/7 Generator & Solar Microgrid",
      "Dry Rations & Community Kitchen",
      "Separate Sanitation for Women & Children",
      "Livestock Paddock on High Terrace"
    ],
    contact: "+91 94350 XXXXX (DDMA Shelter In-Charge)"
  },
  roadBlockage: {
    location: "South Embankment Road km 3.2",
    reason: "Culvert Breach & Rapid Underflow",
    status: "IMPASSABLE"
  }
};

export const MOCK_RESPONSE_OVERVIEW = {
  metrics: {
    monitoredSettlements: 28,
    activeHighRiskSettlements: 5,
    totalExposedPopulation: 16380,
    activeSheltersReady: 12,
    impassableRoadKm: 16.1,
    averageLeadTimeHours: 8.2,
    pipelineHealthScore: "98% Healthy"
  },
  dataSources: [
    { name: "IMD Doppler Radar (Mohanbari)", status: "OPERATIONAL", latency: "1.2 min", coverage: "100%", error: null },
    { name: "CWC Hydrological Gauges (Nematighat)", status: "OPERATIONAL", latency: "45 sec", coverage: "95%", error: null },
    { name: "Copernicus Sentinel-1 SAR (Inundation)", status: "OPERATIONAL", latency: "Pass @ 06:12 UTC", coverage: "Full Basin", error: null },
    { name: "Ground LoRa IoT Water Gauges", status: "OPERATIONAL", latency: "Real-time (2s)", coverage: "24 of 24 Nodes", error: null },
    { name: "Historical Monsoon Re-Analysis Archive", status: "ONLINE", latency: "Static", coverage: "1998-2024 (26 Years)", error: null }
  ],
  modelEvaluation: {
    precision: "89.4%",
    recall: "92.1%",
    falseAlarmRate: "8.6%",
    evaluatedIncidents: 418,
    benchmarkPeriod: "Monsoon Seasons 2021-2025 (Historical Holdout)",
    disclaimer: "Prototype AI evaluation metrics computed on historical validation holdouts. Designed for decision-support, not statutory certification."
  }
};
