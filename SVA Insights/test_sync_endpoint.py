#!/usr/bin/env python3
"""
Test the sync endpoint directly to see debug output.
"""

import requests
import json

def test_sync():
    base_url = "http://localhost:5000"
    
    # Create a session
    session = requests.Session()
    
    try:
        # First, get the login page to establish session
        print("Getting login page...")
        login_page = session.get(f"{base_url}/login")
        print(f"Login page status: {login_page.status_code}")
        
        # Login with the password
        print("Logging in...")
        login_data = {"password": "S@V25"}
        login_response = session.post(f"{base_url}/login", data=login_data)
        print(f"Login response status: {login_response.status_code}")
        
        if login_response.status_code == 200 and "login" not in login_response.url:
            print("✅ Successfully logged in")
        else:
            print("❌ Login failed")
            return
        
        # Now call the sync endpoint
        print("Calling sync endpoint...")
        sync_response = session.get(f"{base_url}/sync_spreadsheet")
        print(f"Sync response status: {sync_response.status_code}")
        
        if sync_response.status_code == 200:
            try:
                result = sync_response.json()
                print("✅ Sync response:")
                print(json.dumps(result, indent=2))
            except json.JSONDecodeError:
                print("❌ Response is not JSON:")
                print(sync_response.text[:500])
        else:
            print(f"❌ Sync failed with status {sync_response.status_code}")
            print(sync_response.text[:500])
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_sync()
