import os
import httpx
from typing import List, Dict, Any

GEONAMES_API_URL = "http://api.geonames.org/searchJSON"

async def fetch_geonames_settlements(query: str = "Assam", country: str = "IN", max_rows: int = 10) -> List[Dict[str, Any]]:
    """
    Fetches real populated places from the GeoNames API.
    """
    username = os.environ.get("GEONAMES_USERNAME")
    if not username:
        raise ValueError("GEONAMES_USERNAME environment variable is not set")
    
    params = {
        "q": query,
        "country": country,
        "featureClass": "P", # Populated places
        "maxRows": max_rows,
        "username": username
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(GEONAMES_API_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        results = []
        for geoname in data.get("geonames", []):
            results.append({
                "id": str(geoname.get("geonameId")),
                "name": geoname.get("name"),
                "latitude": float(geoname.get("lat")),
                "longitude": float(geoname.get("lng")),
                "population": int(geoname.get("population", 0)),
                "area_km2": None, # GeoNames doesn't reliably provide this
                "district": geoname.get("adminName2", ""),
                "state": geoname.get("adminName1", "")
            })
        
        return results
