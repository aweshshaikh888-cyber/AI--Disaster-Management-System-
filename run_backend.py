import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    import uvicorn
    print("=" * 65)
    print(" DISASTER-AI PLATFORM - BACKEND REST API SERVER")
    print(" URL: http://127.0.0.1:8000")
    print(" Interactive Swagger Docs: http://127.0.0.1:8000/docs")
    print("=" * 65)
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
