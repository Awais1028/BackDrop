import requests
import json

BASE_URL = "http://localhost:8000/api/v1"
EMAIL = "test_debug@example.com"
PASSWORD = "password123"

def debug_workflow():
    # 1. Login
    print(f"Logging in as {EMAIL}...")
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
        if resp.status_code != 200:
            print(f"Login failed: {resp.text}")
            return
        token = resp.json()["access_token"]
        print("Login successful.")
    except Exception as e:
        print(f"Login exception: {e}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create a dummy project (if none exist, to ensure we have data)
    print("Creating dummy project...")
    try:
        # Create a dummy file
        files = {'file': ('dummy.pdf', b'dummy content', 'application/pdf')}
        data = {
            'metadata': json.dumps({
                "title": "Debug Project",
                "budget_target": 10000,
                "production_window": "2025",
                "demographics": {
                    "ageStart": 18,
                    "ageEnd": 35,
                    "gender": "All"
                }
            })
        }
        resp = requests.post(f"{BASE_URL}/projects/", headers=headers, files=files, data=data)
        if resp.status_code == 200:
            print("Project created.")
            print("Create Response:", json.dumps(resp.json(), indent=2))
        else:
            print(f"Project creation failed: {resp.text}")
    except Exception as e:
        print(f"Create project exception: {e}")

    # 3. Get Projects
    print("Fetching projects...")
    try:
        resp = requests.get(f"{BASE_URL}/projects/", headers=headers)
        print("Raw Projects Response:", resp.text)
        projects = resp.json()
        if isinstance(projects, list) and len(projects) > 0:
            print(f"First project keys: {projects[0].keys()}")
    except Exception as e:
        print(f"Get projects exception: {e}")

if __name__ == "__main__":
    debug_workflow()