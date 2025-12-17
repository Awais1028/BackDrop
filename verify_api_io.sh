#!/bin/bash

BASE_URL="http://localhost:8000/api/v1"
EMAIL="test_io_verify@example.com"
PASSWORD="password123"

echo "1. Signup/Login..."
# Try to signup, ignore error if exists
curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"name\": \"IO Tester\", \"role\": \"creator\"}" > /dev/null

# Login
TOKEN_RESP=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

TOKEN=$(echo $TOKEN_RESP | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Login failed. Response: $TOKEN_RESP"
    exit 1
fi
echo "Login successful."

echo "2. Creating Project..."
echo "dummy content" > verify_dummy.pdf
CREATE_RESP=$(curl -s -X POST "$BASE_URL/projects/" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@verify_dummy.pdf" \
  -F 'metadata={"title": "IO Verify Project", "budget_target": 5000, "production_window": "2025", "demographics": {"ageStart": 20, "ageEnd": 40, "gender": "All"}}')

echo "Create Response: $CREATE_RESP"

echo "3. Fetching Projects..."
GET_RESP=$(curl -s -X GET "$BASE_URL/projects/" \
  -H "Authorization: Bearer $TOKEN")

echo "Get Response: $GET_RESP"

# Check for "id" field (not "_id")
if [[ "$GET_RESP" == *"\"id\":"* ]]; then
    echo "SUCCESS: Found 'id' field in response."
else
    echo "FAILURE: 'id' field missing in response."
    if [[ "$GET_RESP" == *"\"_id\":"* ]]; then
        echo "Found '_id' instead. Serialization fix needed."
    fi
fi

rm verify_dummy.pdf