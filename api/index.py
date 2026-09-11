import os
import sys
from pathlib import Path

# Ensure project root is in sys.path for imports
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

# Load environment variables from backend/.env if present
env_path = Path(PROJECT_ROOT) / "backend" / ".env"
if env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=env_path)

# Import FastAPI app defined in backend/main.py
from backend.main import app

__all__ = ["app"]
