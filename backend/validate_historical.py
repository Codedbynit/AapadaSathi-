import asyncio
import json
from pathlib import Path
import sqlite3
from backend.services.historical_data import build_historical_dataset

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "backend" / "data"
DB_PATH = DATA_DIR / "aapadasathi.db"
OUTPUT_PATH = DATA_DIR / "historical_features.json"

async def validate_historical_pipeline():
    # 1. Fetch one settlement from the existing cache
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM settlements LIMIT 1")
    row = cursor.fetchone()
    conn.close()

    if not row:
        print("No settlements in database! Make sure GeoNames init ran.")
        return
        
    settlement = dict(row)
    print(f"Validation Settlement: {settlement['name']}")
    print(f"Coordinates: {settlement['latitude']}, {settlement['longitude']}")

    # 2. Define historical date range for validation (e.g. 1 month in 2023)
    start_date = "2023-06-01"
    end_date = "2023-06-30"

    print(f"Fetching historical ML data from {start_date} to {end_date}...")
    dataset = await build_historical_dataset(
        lat=settlement['latitude'],
        lon=settlement['longitude'],
        start_date=start_date,
        end_date=end_date
    )

    # 3. Store validated dataset
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(dataset, f, indent=4)
        
    print(f"Successfully retrieved {len(dataset)} daily records.")
    print(f"Saved to {OUTPUT_PATH}")

if __name__ == "__main__":
    asyncio.run(validate_historical_pipeline())
