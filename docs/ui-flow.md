# AapadaSathi User Flow & Interaction Architecture

## 1. Primary Public Resident Persona
The resident journey is streamlined to ensure life-safety actions take less than 10 seconds to discover and execute during a crisis.

```
[ Landing / Home ]
       │
       ├─► [ Search / Click Settlement ] (e.g. Mikirpara)
       │        │
       │        ▼
       ├─► [ Resident Risk Dashboard ]
       │        │
       │        ├─► [ Understand Risk Score & Lead Time (Gauge) ]
       │        ├─► [ Check Contributing Sensors (Rain, Gauge, SAR) ]
       │        ├─► [ Review Immediate Safety Checklist ]
       │        │
       │        ▼ (If Risk is High or Critical)
       └─► [ Safe Evacuation Route ]
                │
                ├─► [ Interactive Leaflet Evacuation Corridor ]
                ├─► [ Check Designated Safe Shelter Capacity & Elevation ]
                ├─► [ Note Road Hazards & Submerged Bridges ]
                ├─► [ Follow Numbered Turn-by-Turn Instructions ]
                └─► [ 1-Tap Emergency Hotline (112) ]
```

## 2. Official Responder Persona
Disaster-response officials and technical judges access an operational cockpit:

```
[ Official Persona Switch ]
       │
       ▼
[ Response Dashboard ]
       │
       ├─► [ Basin Overview Metrics (At-risk Population, Inundated Roads) ]
       ├─► [ Priority Settlement Action Queue (Sorted by Lead-Time Urgency) ]
       ├─► [ Multi-Sensor Ingestion Pipeline Health (Radar, SAR, Gauges) ]
       ├─► [ Model Reliability & Evaluation Holdout Metrics (Precision/Recall) ]
       └─► [ Multi-Channel Alert Composer (Cellular SMS & Push Preview) ]
```

## 3. Geospatial Intelligence Flow (Live Risk Map)
- Filter settlements by hazard type (Flood, Erosion, Waterlogging) or severity (Critical, High, Moderate, Low).
- Pulsing radar wave rings visually differentiate high-urgency zones.
- Interactive popups allow one-click jumping to the settlement's Risk Dashboard or direct Evacuation Corridor.
- Accessible text-only list mode is available for low-bandwidth or assistive technology users.
