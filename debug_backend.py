import sys
import os

# Add the current directory to sys.path so we can import backend
sys.path.append(os.getcwd())

try:
    print("Attempting to import backend.main...")
    from backend.main import app
    print("Successfully imported backend.main:app")
except Exception as e:
    print(f"Failed to import backend.main:app. Error: {e}")
    import traceback
    traceback.print_exc()