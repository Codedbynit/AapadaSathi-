import sqlite3
from pathlib import Path
from typing import List, Optional, Dict, Any
import asyncio
from backend.services.geonames import fetch_geonames_settlements

# Define paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "aapadasathi.db"

async def init_db():
    """
    Initializes the SQLite database, creates the settlements table,
    and seeds it with initial real-world data if empty.
    """
    # Create the data directory if it doesn't exist
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settlements (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            population INTEGER NOT NULL,
            area_km2 REAL,
            district TEXT,
            state TEXT
        )
    ''')
    
    # Check if data already exists
    cursor.execute("SELECT COUNT(*) FROM settlements")
    count = cursor.fetchone()[0]
    
    if count == 0:
        try:
            # Seed from real GeoNames data
            geonames_data = await fetch_geonames_settlements("Assam", "IN", 10)
            
            insert_data = [
                (
                    s["id"], s["name"], s["latitude"], s["longitude"], 
                    s["population"], s["area_km2"], s["district"], s["state"]
                ) for s in geonames_data
            ]
            
            if insert_data:
                cursor.executemany('''
                    INSERT INTO settlements (id, name, latitude, longitude, population, area_km2, district, state)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', insert_data)
                conn.commit()
        except Exception as e:
            print(f"Failed to fetch from GeoNames: {e}")
            # If GeoNames fails and there's no cache, we remain empty.
            # We do NOT fallback to fake data.
            pass
    
    conn.close()

def get_all_settlements() -> List[Dict[str, Any]]:
    """
    Returns all settlements from the database.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM settlements")
    rows = cursor.fetchall()
    
    conn.close()
    
    return [dict(row) for row in rows]

def get_settlement(settlement_id: str) -> Optional[Dict[str, Any]]:
    """
    Returns a single settlement by its ID, or None if not found.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM settlements WHERE id = ?", (settlement_id,))
    row = cursor.fetchone()
    
    conn.close()
    
    if row:
        return dict(row)
    return None
