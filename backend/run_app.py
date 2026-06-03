import uvicorn
import multiprocessing
import webbrowser
import time
from threading import Thread
from app.main import app

def start_server():
    print("Starting server on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)

def open_browser():
    # Wait for the server to spin up
    time.sleep(2.5)
    print("Opening web browser...")
    webbrowser.open("http://127.0.0.1:8000")

if __name__ == '__main__':
    # Required to prevent PyInstaller from spawning infinite processes on Windows
    multiprocessing.freeze_support()
    
    # Start browser opener in a background thread
    t = Thread(target=open_browser, daemon=True)
    t.start()
    
    # Start FastAPI server
    start_server()
