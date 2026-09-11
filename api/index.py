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
