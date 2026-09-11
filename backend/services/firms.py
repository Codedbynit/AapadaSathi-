import os
import csv
import io
from typing import List, Dict
import httpx
from fastapi import HTTPException

NASA_FIRMS_ENDPOINT = "https://firms.modaps.eosdis.nasa.gov/api/area/csv/"

async def get_firms_data(min_lat: float, max_lat: float, min_lon: float, max_lon: float) -> List[Dict]:
    """Fetch NASA FIRMS fire detections for a bounding box.

    Parameters
    ----------
    min_lat, max_lat, min_lon, max_lon: float
        Geographic bounding box limits.
    Returns
    -------
    List[Dict]
        List of fire detection records with selected fields.
    """
    api_key = os.getenv("NASA_FIRMS_MAP_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="NASA FIRMS API key not configured")

    params = {
        "lat_min": min_lat,
        "lat_max": max_lat,
        "lon_min": min_lon,
        "lon_max": max_lon,
        "sensor": "VIIRS",
        "key": api_key,
        "format": "csv",
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(NASA_FIRMS_ENDPOINT, params=params)
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Failed to fetch data from NASA FIRMS") from exc

    # NASA returns CSV; parse it.
    text = response.text.strip()
    if not text:
        return []
    csv_file = io.StringIO(text)
    reader = csv.DictReader(csv_file)
    records: List[Dict] = []
    for row in reader:
        record = {
            "latitude": float(row.get("latitude", 0)),
            "longitude": float(row.get("longitude", 0)),
            "acq_date": row.get("acq_date"),
            "acq_time": row.get("acq_time"),
            "satellite": row.get("satellite"),
            "instrument": row.get("instrument"),
            "confidence": row.get("confidence"),
            "frp": row.get("frp"),
            "daynight": row.get("daynight"),
        }
        records.append(record)
    return records
