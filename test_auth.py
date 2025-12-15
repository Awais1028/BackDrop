import requests
import sys

BASE_URL = "http://localhost:8000/api/v1/auth"
TEST_EMAIL = "test_creator@example.com"
TEST_PASSWORD = "securepassword123"

def test_signup():
    print("Testing Signup...")
    payload = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "name": "Test Creator",
        "role": "creator"
    }
    try:
        response = requests.post(f"{BASE_URL}/signup", json=payload)
        if response.status_code == 200:
            print("Signup Successful:", response.json())
            return True
        elif response.status_code == 400 and "Email already registered" in response.text:
            print("User already exists, proceeding to login...")
            return True
        else:
            print(f"Signup Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Signup Error: {e}")
        return False

def test_login():
    print("\nTesting Login...")
    payload = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    try:
        response = requests.post(f"{BASE_URL}/login", json=payload)
        if response.status_code == 200:
            token_data = response.json()
            print("Login Successful!")
            print(f"Access Token: {token_data['access_token'][:20]}...")
            return True
        else:
            print(f"Login Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Login Error: {e}")
        return False

if __name__ == "__main__":
    if test_signup():
        if test_login():
            print("\nAuth Verification Complete: SUCCESS")
            sys.exit(0)
    
    print("\nAuth Verification Complete: FAILED")
    sys.exit(1)