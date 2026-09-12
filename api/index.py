import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Explicitly load environment variables from .env and .env.local files
for env_name in [".env.local", ".env"]:
    api_env = Path(__file__).parent / env_name
    if api_env.exists():
        load_dotenv(dotenv_path=api_env, override=False)
    root_env = Path(__file__).parent.parent / env_name
    if root_env.exists():
        load_dotenv(dotenv_path=root_env, override=False)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from api.services.weather import get_weather_data
from api.services.flood import get_flood_data
from api.services.settlements import init_db, get_all_settlements, get_settlement
from api.services.firms import get_firms_data
from api.services.sos import save_sos_request

class SosRequestPayload(BaseModel):
    emergency_type: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: str

    @validator('emergency_type')
    def validate_emergency_type(cls, v):
        if not v or not isinstance(v, str):
            raise ValueError("emergency_type is required")
        v_upper = v.strip().upper()
        allowed = {"FLOOD", "FIRE", "MEDICAL", "OTHER"}
        if v_upper not in allowed:
            raise ValueError(f"Invalid emergency_type '{v}'. Must be one of: FLOOD, FIRE, MEDICAL, OTHER")
        return v_upper

    @validator('latitude')
    def validate_latitude(cls, v):
        if v is not None:
            if not isinstance(v, (int, float)) or v < -90.0 or v > 90.0:
                raise ValueError("Latitude must be a valid number between -90 and 90")
        return v

    @validator('longitude')
    def validate_longitude(cls, v):
        if v is not None:
            if not isinstance(v, (int, float)) or v < -180.0 or v > 180.0:
                raise ValueError("Longitude must be a valid number between -180 and 180")
        return v

    @validator('timestamp')
    def validate_timestamp(cls, v):
        if not v or not isinstance(v, str) or len(v.strip()) == 0:
            raise ValueError("Timestamp is required")
        return v.strip()

app = FastAPI(title="SetuAlert Backend")

@app.on_event("startup")
async def startup_event():
    # Initialize the SQLite database and seed initial data if needed
    await init_db()

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "SetuAlert backend is running"
    }

@app.get("/api/config")
async def frontend_config():
    """
    Returns public frontend configuration.
    CARTO_BASEMAP_API_KEY is read from server environment — never exposed in client JS.
    """
    carto_key = os.environ.get("CARTO_BASEMAP_API_KEY", "")
    if carto_key:
        tile_url = f"https://{{s}}.basemaps.cartocdn.com/rastertiles/voyager/{{z}}/{{x}}/{{y}}{{r}}.png?key={carto_key}"
    else:
        # Fallback to keyless URL (shows watermark if CARTO enforces key)
        tile_url = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
    return {
        "map_tile_url": tile_url,
        "map_attribution": "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
    }

@app.get("/api/weather")
async def weather(lat: float, lon: float):
    return await get_weather_data(lat, lon)

@app.get("/api/flood")
async def flood(lat: float, lon: float):
    return await get_flood_data(lat, lon)

@app.get("/api/settlements")
async def settlements():
    return get_all_settlements()

@app.get("/api/settlements/{settlement_id}")
async def settlement(settlement_id: str):
    data = get_settlement(settlement_id)
    if not data:
        raise HTTPException(status_code=404, detail="Settlement not found")
    return data

@app.get("/api/firms")
async def firms(
    min_lat: Optional[float] = None,
    max_lat: Optional[float] = None,
    min_lon: Optional[float] = None,
    max_lon: Optional[float] = None,
    south: Optional[float] = None,
    north: Optional[float] = None,
    west: Optional[float] = None,
    east: Optional[float] = None,
    source: str = "VIIRS_NOAA20_NRT",
    day_range: int = 1
):
    """Return NASA FIRMS fire detections for the given geographic bounding box.
    This endpoint is *only* for fire data – it is NOT used for flood labeling.
    """
    final_min_lat = south if south is not None else (min_lat if min_lat is not None else 24.0)
    final_max_lat = north if north is not None else (max_lat if max_lat is not None else 28.5)
    final_min_lon = west if west is not None else (min_lon if min_lon is not None else 89.5)
    final_max_lon = east if east is not None else (max_lon if max_lon is not None else 96.0)

    data = await get_firms_data(
        min_lat=final_min_lat,
        max_lat=final_max_lat,
        min_lon=final_min_lon,
        max_lon=final_max_lon,
        source=source,
        day_range=day_range
    )
    return data

from fastapi.responses import JSONResponse

@app.post("/api/sos")
async def create_sos(payload: SosRequestPayload):
    """Receive emergency SOS request, validate fields, persist to database,
    and dispatch real Twilio SMS.
    """
    result = save_sos_request(
        emergency_type=payload.emergency_type,
        latitude=payload.latitude,
        longitude=payload.longitude,
        timestamp=payload.timestamp
    )
    if not result.get("success"):
        return JSONResponse(status_code=500, content=result)
    return result


