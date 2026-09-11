import os
import csv
from typing import List, Dict
import httpx
from fastapi import HTTPException

# Load NASA FIRMS API key from environment (dotenv already loaded in api/index.py)
NASA_FIRMS_MAP_KEY = os.getenv("NASA_FIRMS_MAP_KEY")

if not NASA_FIRMS_MAP_KEY:
    raise RuntimeError("NASA_FIRMS_MAP_KEY environment variable not set")

BASE_URL = "https://firms.modaps.eosdis.nasa.gov/api/area/csv/VIIRS_Noaa20_NRT"

async def get_firms_data(min_lat: float, max_lat: float, min_lon: float, max_lon: float) -> List[Dict]:
    """Retrieve NASA FIRMS fire detections for the given bounding box.

    Parameters
    ----------
    min_lat, max_lat, min_lon, max_lon : float
        Geographic bounding box coordinates.
    Returns
    -------
    List[Dict]
        List of records preserving key FIRMS fields.
    """
    bbox = f"{min_lat},{max_lat},{min_lon},{max_lon}"
    url = f"{BASE_URL}/{bbox}?key={NASA_FIRMS_MAP_KEY}"
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url)
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="NASA FIRMS service error")
    # CSV response may include a header line; parse it
    text = resp.text.strip()
    if not text:
        return []
    lines = text.splitlines()
    # The first line is the header; subsequent lines are data
    reader = csv.DictReader(lines)
    records = []
    for row in reader:
        record = {
            "latitude": float(row.get("latitude", 0)),
            "longitude": float(row.get("longitude", 0)),
            "acq_date": row.get("acq_date", ""),
            "acq_time": row.get("acq_time", ""),
            "satellite": row.get("satellite", ""),
            "instrument": row.get("instrument", ""),
            "confidence": row.get("confidence", ""),
            "frp": float(row.get("frp", 0)),
            "daynight": row.get("daynight", "")
        }
        records.append(record)
    return records
