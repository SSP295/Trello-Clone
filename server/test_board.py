"""
Quick test script for board creation
"""
import requests
import json

url = "http://localhost:5000/api/boards"
data = {
    "title": "Test Board",
    "description": "Test Description",
    "background": "#0079bf"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except requests.exceptions.ConnectionError:
    print("ERROR: Server is not running. Start the server first:")
    print("  cd server")
    print("  python -m uvicorn main:app --reload --port 5000")
except Exception as e:
    print(f"ERROR: {e}")
