# AapadaSathi Backend API Contract (FastAPI)

This document specifies the exact REST API schema expected by the frontend. To connect the frontend to your FastAPI backend, implement these endpoints and set `CONFIG.USE_MOCK_DATA = false` in `js/config.js`.

---

## 1. GET `/api/settlements`
Retrieve all monitored settlements within the river basin.

### Response (200 OK):
```json
[
  {
    "id": "settlement-01",
    "name": "Mikirpara Settlement",
    "district": "Majuli",
    "state": "Assam",
    "latitude": 26.9650,
    "longitude": 94.1820,
    "population": 3420,
    "riskScore": 89,
    "riskLevel": "CRITICAL",
    "hazardType": "FLOOD",
    "confidence": "91%",
    "leadTimeHours": 6.5,
    "updatedAt": "12 mins ago",
    "evacuationRequired": true,
    "routeAvailable": true
  }
]
```

---

## 2. GET `/api/risk/{settlement_id}`
Retrieve localized hazard risk, multi-sensor factor breakdown, and exposure impact.

### Response (200 OK):
```json
{
  "settlement": {
    "id": "settlement-01",
    "name": "Mikirpara Settlement",
    "district": "Majuli",
    "state": "Assam",
    "coordinates": [26.9650, 94.1820]
  },
  "hazard": "Flash Riverine Flooding",
  "hazardType": "FLOOD",
  "riskScore": 89,
  "riskLevel": "CRITICAL",
  "confidence": "91%",
  "leadTimeHours": 6.5,
  "explanation": "Critical flood surge projected in ~6.5 hours...",
  "factors": [
    {
      "id": "f1",
      "name": "Rainfall Intensity",
      "icon": "fa-cloud-showers-heavy",
      "value": "142 mm",
      "unit": "past 24h",
      "normal": "32 mm",
      "trend": "+340% (Severe)",
      "status": "danger",
      "explanation": "Continuous high-intensity rainfall..."
    }
  ],
  "impact": {
    "peopleAffected": 3420,
    "structuresAffected": 715,
    "roadsAffectedKm": 4.8,
    "priorityLevel": "P1 - IMMEDIATE EVACUATION",
    "affectedAreaKm2": 8.4,
    "estimateType": "AI-Hydro Ensemble Prototype Forecast"
  },
  "recommendedAction": "Evacuate immediately to Model Higher Secondary...",
  "evacuationRequired": true,
  "routeAvailable": true,
  "timeline": [
    { "time": "06:30 AM", "title": "Heavy Inflow Detected", "desc": "Upstream radar detected convective storm cluster." }
  ],
  "confidenceMeta": {
    "availableSources": ["IMD Doppler Radar", "CWC Gauge Nematighat", "Sentinel-1 SAR Extent"],
    "unavailableSources": ["UAV Drone Orthomosaic (Cloud cover)"],
    "modelStatus": "Live Simulated Ensemble (v2.4 Prototype)",
    "nextUpdateExpected": "In 18 minutes (Auto-sync)"
  },
  "updatedAt": "12 mins ago"
}
```

---

## 3. GET `/api/routes/{settlement_id}`
Retrieve evacuation corridor directions, designated shelter destination, and road hazard notices.

### Response (200 OK):
```json
{
  "settlementId": "settlement-01",
  "settlementName": "Mikirpara Settlement",
  "currentRisk": "CRITICAL (Score: 89)",
  "shelterId": "shelter-01",
  "shelterName": "Model Higher Secondary & Multi-Purpose Flood Shelter",
  "shelterCoordinates": [26.9940, 94.2250],
  "distanceKm": 4.2,
  "estimatedMinutesFoot": 50,
  "estimatedMinutesVehicle": 12,
  "routeStatus": "VERIFIED_SAFE",
  "safetyNotes": "North Embankment corridor is reinforced...",
  "lastVerifiedAt": "15 minutes ago by SDRF Field Unit 2",
  "instructions": [
    {
      "step": 1,
      "title": "Depart Mikirpara Ward 4 Northward",
      "detail": "Head north along the main village road...",
      "type": "start"
    }
  ],
  "shelterDetails": {
    "name": "Model Higher Secondary & Multi-Purpose Flood Shelter",
    "capacity": 1800,
    "occupancyCurrent": 580,
    "occupancyStatus": "32% Occupied - Ample Space Available",
    "elevation": "+14m above river datum (High Ground)",
    "amenities": ["Drinking Water", "First Aid", "Generator"],
    "contact": "+91 94350 XXXXX (DDMA Shelter In-Charge)"
  },
  "roadBlockage": {
    "location": "South Embankment Road km 3.2",
    "reason": "Culvert Breach & Rapid Underflow",
    "status": "IMPASSABLE"
  }
}
```

---

## 4. GET `/api/alerts`
Retrieve active and archived disaster warnings with optional filters:
- Query Parameters: `severity` (CRITICAL, HIGH, MODERATE, LOW), `hazard` (FLOOD, EROSION, WATERLOGGING), `settlementId`.

---

## 5. GET `/api/response/overview`
Retrieve aggregate metrics, pipeline data source telemetry, and model validation holdout statistics.

---

## 6. POST `/api/alerts/preview`
Generate multi-channel alert previews (SMS & Cellular Push).

### Request:
```json
{
  "settlementId": "settlement-01",
  "settlementName": "Mikirpara Settlement",
  "hazardType": "Flash Riverine Flooding",
  "language": "hi"
}
```
### Response:
```json
{
  "smsText": "[आपदा साथी चेतावनी]...",
  "inAppText": "⚠️ [तत्काल]...",
  "characterCount": 142,
  "language": "hi",
  "generatedAt": "03:15 PM"
}
```
