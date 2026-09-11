import httpx
from typing import List, Dict, Any
from datetime import datetime, timedelta

# Open-Meteo Archive API endpoint for historical weather (precipitation & soil moisture)
HISTORICAL_WEATHER_URL = "https://archive-api.open-meteo.com/v1/archive"

# Open-Meteo Flood API endpoint for historical river discharge
HISTORICAL_FLOOD_URL = "https://flood-api.open-meteo.com/v1/flood"

async def fetch_historical_weather(lat: float, lon: float, start_date: str, end_date: str) -> Dict[str, Any]:
    """
    Fetches daily precipitation and hourly soil moisture (averaged to daily)
    from Open-Meteo Archive API.
    """
    # Open-Meteo archive API has daily precipitation and hourly soil moisture.
    # We will fetch hourly soil moisture and average it out to match daily granularity.
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "daily": "precipitation_sum",
        "hourly": "soil_moisture_0_to_7cm",
        "timezone": "GMT"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(HISTORICAL_WEATHER_URL, params=params)
        response.raise_for_status()
        return response.json()

async def fetch_historical_flood(lat: float, lon: float, start_date: str, end_date: str) -> Dict[str, Any]:
    """
    Fetches daily mean river discharge from Open-Meteo Flood API.
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "daily": "river_discharge_mean",
        "timezone": "GMT"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(HISTORICAL_FLOOD_URL, params=params)
        response.raise_for_status()
        return response.json()

async def build_historical_dataset(lat: float, lon: float, start_date: str, end_date: str) -> List[Dict[str, Any]]:
    """
    Fetches and aligns historical weather and flood data by date.
    Returns a list of daily dictionaries ready for ML training.
    """
    weather_data = await fetch_historical_weather(lat, lon, start_date, end_date)
    flood_data = await fetch_historical_flood(lat, lon, start_date, end_date)

    daily_dates = weather_data.get("daily", {}).get("time", [])
    precip_sums = weather_data.get("daily", {}).get("precipitation_sum", [])
    
    # Process hourly soil moisture into daily averages
    hourly_dates = weather_data.get("hourly", {}).get("time", [])
    hourly_soil = weather_data.get("hourly", {}).get("soil_moisture_0_to_7cm", [])
    
    daily_soil = []
    # Open-Meteo guarantees 24 hourly data points per day in GMT
    # Let's group them by the prefix (YYYY-MM-DD)
    date_to_soil = {}
    for dt_str, sm in zip(hourly_dates, hourly_soil):
        d_str = dt_str.split("T")[0]
        if d_str not in date_to_soil:
            date_to_soil[d_str] = []
        if sm is not None:
            date_to_soil[d_str].append(sm)
            
    for d_str in daily_dates:
        sm_list = date_to_soil.get(d_str, [])
        if sm_list:
            daily_soil.append(sum(sm_list) / len(sm_list))
        else:
            daily_soil.append(None)

    # Process flood data
    flood_dates = flood_data.get("daily", {}).get("time", [])
    flood_discharge = flood_data.get("daily", {}).get("river_discharge_mean", [])
    
    date_to_discharge = dict(zip(flood_dates, flood_discharge))

    dataset = []
    for i, d_str in enumerate(daily_dates):
        # We enforce NO FAKE DATA - if something is None/missing, we do NOT impute it.
        precip = precip_sums[i] if i < len(precip_sums) else None
        soil = daily_soil[i] if i < len(daily_soil) else None
        discharge = date_to_discharge.get(d_str, None)

        record = {
            "date": d_str,
            "precipitation_sum_mm": precip,
            "soil_moisture_0_to_7cm_mean": soil,
            "river_discharge_mean_m3s": discharge,
            "target_flood_event": None  # Placeholder, as no reliable event API is available without GIS integration
        }
        dataset.append(record)

    return dataset
