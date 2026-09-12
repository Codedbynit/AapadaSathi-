import os
import csv
import io
from typing import List, Dict, Any, Union
import httpx

NASA_FIRMS_BASE_URL = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"

def _safe_float(val: Any) -> Union[float, None]:
    try:
        return float(val) if val is not None else None
    except (ValueError, TypeError):
        return None

async def get_firms_data(
    min_lat: float = 24.0,
    max_lat: float = 28.5,
    min_lon: float = 89.5,
    max_lon: float = 96.0,
    source: str = "VIIRS_NOAA20_NRT",
    day_range: int = 1
) -> Union[List[Dict[str, Any]], Dict[str, Any]]:
    """Fetch NASA FIRMS fire detections for a bounding box.

    Parameters
    ----------
    min_lat, max_lat, min_lon, max_lon: float
        Bounding box limits.
        Official NASA FIRMS Area API bounding box parameter order:
        west,south,east,north (min_lon, min_lat, max_lon, max_lat)
    source: str
        Satellite source (default: VIIRS_NOAA20_NRT)
    day_range: int
        Range in days (default: 1)

    Returns
    -------
    Union[List[Dict], Dict]
        List of detection records if successful, empty list if no detections,
        or a clean unavailable response dict if key missing / NASA API unavailable.
    """
    api_key = os.getenv("NASA_FIRMS_MAP_KEY", "").strip()
    if not api_key:
        return {
            "status": "unavailable",
            "message": "NASA_FIRMS_MAP_KEY environment variable is not configured",
            "detections": []
        }

    # Bounding box order for NASA FIRMS Area API: west,south,east,north
    area_str = f"{min_lon},{min_lat},{max_lon},{max_lat}"
    url = f"{NASA_FIRMS_BASE_URL}/{api_key}/{source}/{area_str}/{day_range}"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url)

        if response.status_code != 200:
            return {
                "status": "unavailable",
                "message": f"NASA FIRMS API returned HTTP status {response.status_code}",
                "detections": []
            }
    except Exception:
        return {
            "status": "unavailable",
            "message": "Failed to connect to NASA FIRMS API",
            "detections": []
        }

    text = response.text.strip()

    # Check for NASA API error text or HTML response
    if not text or "Invalid MAP_KEY" in text or text.startswith("<!DOCTYPE") or text.startswith("<html"):
        return {
            "status": "unavailable",
            "message": "Invalid response or MAP_KEY from NASA FIRMS",
            "detections": []
        }

    records: List[Dict[str, Any]] = []
    try:
        csv_file = io.StringIO(text)
        reader = csv.DictReader(csv_file)
        for row in reader:
            lat = _safe_float(row.get("latitude"))
            lon = _safe_float(row.get("longitude"))
            if lat is None or lon is None:
                continue

            record = {
                "latitude": lat,
                "longitude": lon,
                "acq_date": row.get("acq_date"),
                "acq_time": row.get("acq_time"),
                "satellite": row.get("satellite"),
                "instrument": row.get("instrument"),
                "confidence": row.get("confidence"),
                "frp": _safe_float(row.get("frp")),
                "daynight": row.get("daynight"),
            }
            records.append(record)
    except Exception:
        return {
            "status": "unavailable",
            "message": "Failed to parse NASA FIRMS CSV response",
            "detections": []
        }

    return records
