import os
from pathlib import Path
from dotenv import load_dotenv

# Explicitly load from backend/.env regardless of where the server is started
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.services.weather import get_weather_data
from backend.services.flood import get_flood_data

app = FastAPI(title="SetuAlert Backend")

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
