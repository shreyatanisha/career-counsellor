import httpx
import asyncio

async def test_endpoints():
    base_url = "http://127.0.0.1:8000"
    
    # Test health
    print("Testing /health")
    r = httpx.get(f"{base_url}/health")
    print(r.status_code, r.text)
    
    # Test intake start
    print("\nTesting /api/intake/start")
    r = httpx.post(f"{base_url}/api/intake/start")
    print(r.status_code, r.text)

if __name__ == "__main__":
    asyncio.run(test_endpoints())
