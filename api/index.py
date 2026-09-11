import os
import sys

# Ensure the project root is in sys.path so imports work
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

# Load environment variables from backend/.env if present
from pathlib import Path
env_path = Path(PROJECT_ROOT) / "backend" / ".env"
if env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=env_path)

# Import the FastAPI app defined in backend/main.py
from backend.main import app

__all__ = ["app"]
