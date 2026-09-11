import httpx
from fastapi import HTTPException

async def get_flood_data(lat: float, lon: float) -> dict:
    if lat < -90 or lat > 90 or lon < -180 or lon > 180:
        raise HTTPException(status_code=400, detail="Invalid latitude or longitude.")

    url = f"https://flood-api.open-meteo.com/v1/flood?latitude={lat}&longitude={lon}&daily=river_discharge"
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Open-Meteo service returned an error.")
            
            data = response.json()
            
            if "error" in data and data["error"]:
                raise HTTPException(status_code=400, detail="Open-Meteo returned an error JSON.")
                
            daily = data.get("daily", {})
            discharge_array = daily.get("river_discharge")
            
            if not daily or discharge_array is None or not isinstance(discharge_array, list):
                raise HTTPException(status_code=500, detail="Missing daily river_discharge data from Open-Meteo.")
                
            # Filter out None values and get the latest (last) valid one
            valid_discharges = [v for v in discharge_array if v is not None]
            
            if not valid_discharges:
                raise HTTPException(status_code=500, detail="Empty river_discharge array or all values are null.")
                
            latest_discharge = valid_discharges[-1]
            
            return {
                "latitude": lat,
                "longitude": lon,
                "river_discharge_m3s": latest_discharge
            }
            
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Flood service connection failed.")
