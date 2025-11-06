#!/usr/bin/env python3
"""
Test script to verify that the sync functionality can detect missing companies using tokens.
"""

import json
import requests
import csv
from io import StringIO
from pathlib import Path

def get_google_sheet_as_csv(sheet_url: str) -> str:
    """Convert Google Sheets URL to CSV export URL and fetch data"""
    if '/d/' in sheet_url:
        sheet_id = sheet_url.split('/d/')[1].split('/')[0]
    else:
        raise ValueError("Invalid Google Sheets URL format")
    
    csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"
    
    try:
        response = requests.get(csv_url, timeout=30)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        raise Exception(f"Failed to fetch Google Sheet: {e}")

def main():
    sheet_url = 'https://docs.google.com/spreadsheets/d/1XA04fIaZI038hTnZAsX5L_BoDk45K2OID7O1ol1Aoxw/edit?pli=1&gid=1201695147#gid=1201695147'
    
    print("=== TESTING SYNC DETECTION ===\n")
    
    try:
        # Fetch data from Google Sheets
        print("Fetching data from Google Sheets...")
        csv_content = get_google_sheet_as_csv(sheet_url)
        reader = csv.DictReader(StringIO(csv_content))
        
        submissions = []
        for row in reader:
            company_name = row.get('Company Name', '').strip()
            token = row.get('Token', '').strip()
            
            if company_name and company_name not in ['Company Name', 'By submitting this application'] and token:
                submissions.append(row)
        
        print(f"Found {len(submissions)} submissions in Google Sheets")
        
        # Load token database
        token_db_path = Path('token_database.json')
        if token_db_path.exists():
            with open(token_db_path, 'r', encoding='utf-8') as f:
                token_db = json.load(f)
        else:
            print("❌ Token database not found!")
            return
        
        analyzed_tokens = set(token_db.get('analyzed_tokens', {}).keys())
        print(f"Found {len(analyzed_tokens)} analyzed tokens in database")
        
        # Find new companies using token-based tracking (same logic as sync function)
        new_companies = []
        for submission in submissions:
            token = submission.get('Token', '').strip()
            company_name = submission.get('Company Name', '')
            
            if token and token not in analyzed_tokens:
                new_companies.append({
                    'company_name': company_name,
                    'token': token
                })
        
        print(f"\n=== SYNC DETECTION RESULTS ===")
        print(f"Total submissions in Google Sheets: {len(submissions)}")
        print(f"Already analyzed (in token database): {len(analyzed_tokens)}")
        print(f"New companies detected: {len(new_companies)}")
        
        if new_companies:
            print(f"\n=== NEW COMPANIES TO ANALYZE ===")
            for i, company in enumerate(new_companies, 1):
                print(f"{i}. {company['company_name']} (Token: {company['token']})")
        else:
            print("\n✅ All companies have been analyzed - Dashboard up to date!")
        
        # Verify the expected missing companies are detected
        expected_missing = ['RainyDayPal', 'Counter Fin', 'BeSound', 'LyfebloodDAO']
        detected_names = [c['company_name'] for c in new_companies]
        
        print(f"\n=== VERIFICATION ===")
        for expected in expected_missing:
            if expected in detected_names:
                print(f"✅ {expected} correctly detected as missing")
            else:
                print(f"❌ {expected} NOT detected (should be missing)")
        
        # Check for unexpected detections
        unexpected = [name for name in detected_names if name not in expected_missing]
        if unexpected:
            print(f"\n⚠️ UNEXPECTED MISSING COMPANIES:")
            for name in unexpected:
                print(f"  - {name}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
