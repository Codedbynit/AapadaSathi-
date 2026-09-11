import os
from pathlib import Path
from dotenv import load_dotenv

# Explicitly load from api/.env regardless of where the server is started
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from api.services.weather import get_weather_data
from api.services.flood import get_flood_data
from api.services.settlements import init_db, get_all_settlements, get_settlement
from api.services.firms import get_firms_data

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
async def firms(min_lat: float, max_lat: float, min_lon: float, max_lon: float):
    """Return NASA FIRMS fire detections for the given geographic bounding box.
    This endpoint is *only* for fire data – it is NOT used for flood labeling.
    """
    data = await get_firms_data(min_lat, max_lat, min_lon, max_lon)
    return data
