import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any, List
import os

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "aapadasathi.db"

# In-memory store for Vercel Serverless environment
_memory_sos_store: List[Dict[str, Any]] = []

def is_vercel() -> bool:
    return os.getenv("VERCEL") == "1"

def init_sos_table():
    if is_vercel():
        return
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sos_requests (
            id TEXT PRIMARY KEY,
            emergency_type TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            timestamp TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def save_sos_request(emergency_type: str, latitude: Optional[float], longitude: Optional[float], timestamp: str) -> Dict[str, Any]:
    """Saves a validated SOS emergency request into SQLite DB or in-memory store.

    Parameters
    ----------
    emergency_type : str
        Validated emergency type (FLOOD, FIRE, MEDICAL, OTHER).
    latitude : Optional[float]
        Real latitude or None.
    longitude : Optional[float]
        Real longitude or None.
    timestamp : str
        Generated timestamp.

    Returns
    -------
    Dict[str, Any]
        { "success": True, "sos_id": "<id>", "status": "RECEIVED" }
    """
    sos_id = f"sos-{uuid.uuid4().hex[:8]}"
    created_at = datetime.now(timezone.utc).isoformat()

    record = {
        "id": sos_id,
        "emergency_type": emergency_type.upper(),
        "latitude": latitude,
        "longitude": longitude,
        "timestamp": timestamp,
        "created_at": created_at
    }

    if is_vercel():
        _memory_sos_store.append(record)
        return {
            "success": True,
            "sos_id": sos_id,
            "status": "RECEIVED"
        }

    init_sos_table()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO sos_requests (id, emergency_type, latitude, longitude, timestamp, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (record["id"], record["emergency_type"], record["latitude"], record["longitude"], record["timestamp"], record["created_at"]))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "sos_id": sos_id,
        "status": "RECEIVED"
    }
