import os
import httpx
from fastapi import HTTPException

async def get_weather_data(lat: float, lon: float) -> dict:
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key or api_key == "your_key_here":
        raise HTTPException(status_code=500, detail="Weather service configuration error: API key missing.")
    
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            
            if response.status_code == 401:
                raise HTTPException(status_code=500, detail="Weather service authentication failed.")
            if response.status_code == 429:
                raise HTTPException(status_code=429, detail="Weather service rate limited.")
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Weather service returned an error.")
            
            data = response.json()
            
            # Extract fields
            temp = data.get("main", {}).get("temp")
            humidity = data.get("main", {}).get("humidity")
            wind_speed = data.get("wind", {}).get("speed")
            
            if temp is None or humidity is None or wind_speed is None:
                raise HTTPException(status_code=500, detail="Weather service returned unexpected data format.")
            
            # Handle rainfall. It might be in 'rain' -> '1h'
            rainfall = 0.0
            if "rain" in data and isinstance(data["rain"], dict):
                rainfall = data["rain"].get("1h", 0.0)
                
            return {
                "latitude": lat,
                "longitude": lon,
                "temperature_c": temp,
                "humidity_percent": humidity,
                "rainfall_mm": rainfall,
                "wind_speed": wind_speed
            }
            
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail="Weather service connection failed.")
