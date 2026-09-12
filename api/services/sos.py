import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any, List

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
            created_at TEXT NOT NULL,
            notification_status TEXT NOT NULL DEFAULT 'FAILED'
        )
    ''')
    # Add column if table existed prior without notification_status
    cursor.execute("PRAGMA table_info(sos_requests)")
    columns = [row[1] for row in cursor.fetchall()]
    if "notification_status" not in columns:
        try:
            cursor.execute("ALTER TABLE sos_requests ADD COLUMN notification_status TEXT DEFAULT 'FAILED'")
        except Exception:
            pass

    conn.commit()
    conn.close()

def send_twilio_sos_sms(emergency_type: str, latitude: Optional[float], longitude: Optional[float], timestamp: str) -> bool:
    """Dispatches a real SMS alert via Twilio using server environment variables:
    - TWILIO_ACCOUNT_SID
    - TWILIO_AUTH_TOKEN
    - TWILIO_PHONE_NUMBER
    - SOS_RECIPIENT_PHONE

    Returns True if Twilio successfully accepts the message request, False otherwise.
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    from_number = os.getenv("TWILIO_PHONE_NUMBER", "").strip()
    to_number = os.getenv("SOS_RECIPIENT_PHONE", "").strip()

    if not account_sid or not auth_token or not from_number or not to_number:
        # Diagnostic logging for missing env vars (values are not printed for security)
        missing = []
        if not account_sid:
            missing.append('TWILIO_ACCOUNT_SID')
        if not auth_token:
            missing.append('TWILIO_AUTH_TOKEN')
        if not from_number:
            missing.append('TWILIO_PHONE_NUMBER')
        if not to_number:
            missing.append('SOS_RECIPIENT_PHONE')
        print(f"[Twilio SMS] Missing environment variables: {', '.join(missing)}")
        return False

    try:
        from twilio.rest import Client
        client = Client(account_sid, auth_token)

        if latitude is not None and longitude is not None:
            location_str = f"Latitude: {latitude}\nLongitude: {longitude}"
        else:
            location_str = "Unavailable (Location permission denied)"

        body_text = (
            f"AapadaSathi SOS ALERT\n\n"
            f"Emergency: {emergency_type.upper()}\n\n"
            f"Location:\n{location_str}\n\n"
            f"Time:\n{timestamp}\n\n"
            f"This is an emergency SOS request."
        )

        message = client.messages.create(
            body=body_text,
            from_=from_number,
            to=to_number
        )

        if message and message.sid:
            return True
        return False
    except Exception as exc:
        # Capture detailed Twilio error information if available
        try:
            # Twilio REST exceptions typically have .code, .msg, .status attributes
            error_code = getattr(exc, 'code', None)
            error_msg = getattr(exc, 'msg', str(exc))
            http_status = getattr(exc, 'status', None)
            print(f"[Twilio SMS] Dispatch failed: {type(exc).__name__}, code={error_code}, status={http_status}, message={error_msg}")
        except Exception:
            # Fallback if attributes are not present
            print(f"[Twilio SMS] Dispatch failed: {type(exc).__name__}: {exc}")
        return False

def save_sos_request(emergency_type: str, latitude: Optional[float], longitude: Optional[float], timestamp: str) -> Dict[str, Any]:
    """Saves SOS request to SQLite/in-memory store, dispatches Twilio SMS (if configured), and returns result status.

    Returns
    -------
    Dict[str, Any]
        If Twilio configured & succeeds: { "success": True, "sos_id": "...", "status": "RECEIVED", "notification_status": "SENT" }
        If Twilio configured & fails: { "success": True, "sos_id": "...", "status": "RECEIVED", "notification_status": "FAILED" }
        If Twilio not configured: { "success": True, "sos_id": "...", "status": "RECEIVED", "notification_status": "NOT_CONFIGURED" }
    """
    sos_id = f"sos-{uuid.uuid4().hex[:8]}"
    created_at = datetime.now(timezone.utc).isoformat()
    type_upper = emergency_type.upper()

    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    from_number = os.getenv("TWILIO_PHONE_NUMBER", "").strip()
    to_number = os.getenv("SOS_RECIPIENT_PHONE", "").strip()

    is_twilio_configured = bool(account_sid and auth_token and from_number and to_number)
    # Diagnostic logging for environment configuration and runtime context
    print(f"[SOS] Twilio config - SID set: {bool(account_sid)}, Token set: {bool(auth_token)}, From set: {bool(from_number)}, To set: {bool(to_number)}")
    print(f"[SOS] Running on Vercel: {is_vercel()}")

    if is_twilio_configured:
        sms_sent = send_twilio_sos_sms(
            emergency_type=type_upper,
            latitude=latitude,
            longitude=longitude,
            timestamp=timestamp
        )
        notification_status = "SENT" if sms_sent else "FAILED"
    else:
        notification_status = "NOT_CONFIGURED"

    record = {
        "id": sos_id,
        "emergency_type": type_upper,
        "latitude": latitude,
        "longitude": longitude,
        "timestamp": timestamp,
        "created_at": created_at,
        "notification_status": notification_status
    }

    if is_vercel():
        _memory_sos_store.append(record)
    else:
        init_sos_table()
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO sos_requests (id, emergency_type, latitude, longitude, timestamp, created_at, notification_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (record["id"], record["emergency_type"], record["latitude"], record["longitude"], record["timestamp"], record["created_at"], record["notification_status"]))
        conn.commit()
        conn.close()

    return {
        "success": True,
        "sos_id": sos_id,
        "status": "RECEIVED",
        "notification_status": notification_status
    }
