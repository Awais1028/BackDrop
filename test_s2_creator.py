import requests
import sys
import os
import json

BASE_URL = "http://localhost:8000/api/v1"
AUTH_URL = f"{BASE_URL}/auth"
PROJECTS_URL = f"{BASE_URL}/projects"
SLOTS_URL = f"{BASE_URL}/slots"

TEST_EMAIL = "creator_s2@example.com"
TEST_PASSWORD = "password123"

def get_auth_token():
    print("Authenticating...")
    # Try login first
    payload = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
    response = requests.post(f"{AUTH_URL}/login", json=payload)
    
    if response.status_code == 200:
        return response.json()["access_token"]
    
    # If login fails, try signup
    signup_payload = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "name": "S2 Creator",
        "role": "creator"
    }
    response = requests.post(f"{AUTH_URL}/signup", json=signup_payload)
    if response.status_code == 200:
        # Login again to get token
        response = requests.post(f"{AUTH_URL}/login", json=payload)
        return response.json()["access_token"]
    else:
        print(f"Auth failed: {response.text}")
        return None

def test_create_project(token):
    print("\nTesting Create Project...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a dummy file
    with open("dummy_script.pdf", "w") as f:
        f.write("Dummy PDF content")
    
    files = {
        "file": ("dummy_script.pdf", open("dummy_script.pdf", "rb"), "application/pdf")
    }
    
    metadata = {
        "title": "My Awesome Movie",
        "budget_target": 5000000,
        "production_window": "Q3 2025",
        "demographics": {
            "ageStart": 18,
            "ageEnd": 35,
            "gender": "All"
        }
    }
    
    data = {
        "metadata": json.dumps(metadata)
    }
    
    try:
        response = requests.post(PROJECTS_URL + "/", headers=headers, files=files, data=data)
        if response.status_code == 200:
            project = response.json()
            print(f"Project Created JSON: {project}")
            if 'id' in project:
                 print(f"Project Created: {project['id']} - {project['title']}")
            elif '_id' in project:
                 print(f"Project Created (_id): {project['_id']} - {project['title']}")
                 project['id'] = project['_id'] # Fix for test
            else:
                 print("Project Created but no ID found")
            return project
        else:
            print(f"Create Project Failed: {response.status_code} - {response.text}")
            return None
    finally:
        if os.path.exists("dummy_script.pdf"):
            os.remove("dummy_script.pdf")

def test_list_projects(token):
    print("\nTesting List Projects...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(PROJECTS_URL + "/", headers=headers)
    if response.status_code == 200:
        projects = response.json()
        print(f"Found {len(projects)} projects")
        return projects
    else:
        print(f"List Projects Failed: {response.status_code} - {response.text}")
        return []

def test_create_slot(token, project_id):
    print("\nTesting Create Slot...")
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "scene_ref": "Scene 12 - Bar",
        "pricing_floor": 5000,
        "modality": "Private Auction",
        "visibility": "Public",
        "status": "Available"
    }
    
    # Passing project_id as query param as per router definition
    response = requests.post(f"{SLOTS_URL}/?project_id={project_id}", headers=headers, json=payload)
    
    if response.status_code == 200:
        slot = response.json()
        print(f"Slot Created JSON: {slot}")
        if 'id' in slot:
             print(f"Slot Created: {slot['id']} - {slot['scene_ref']}")
        elif '_id' in slot:
             print(f"Slot Created (_id): {slot['_id']} - {slot['scene_ref']}")
             slot['id'] = slot['_id']
        else:
             print("Slot Created but no ID found")
        return slot
    else:
        print(f"Create Slot Failed: {response.status_code} - {response.text}")
        return None

def test_list_slots(token, project_id):
    print("\nTesting List Slots...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{SLOTS_URL}/?project_id={project_id}", headers=headers)
    if response.status_code == 200:
        slots = response.json()
        print(f"Found {len(slots)} slots for project {project_id}")
        return slots
    else:
        print(f"List Slots Failed: {response.status_code} - {response.text}")
        return []

if __name__ == "__main__":
    token = get_auth_token()
    if not token:
        sys.exit(1)
    
    project = test_create_project(token)
    if not project:
        sys.exit(1)
        
    projects = test_list_projects(token)
    if not projects:
        sys.exit(1)
        
    slot = test_create_slot(token, project['id'])
    if not slot:
        sys.exit(1)
        
    slots = test_list_slots(token, project['id'])
    if not slots:
        sys.exit(1)
    
    print("\nS2 Creator Workflow Verification: SUCCESS")