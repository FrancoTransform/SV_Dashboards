#!/usr/bin/env python3
"""
Check the Token column in Google Sheets to understand the unique identifier format.
"""

import requests
import csv
from io import StringIO

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
    
    print("=== CHECKING TOKEN COLUMN ===\n")
    
    try:
        # Fetch data from Google Sheets
        csv_content = get_google_sheet_as_csv(sheet_url)
        reader = csv.DictReader(StringIO(csv_content))
        
        submissions = []
        for row in reader:
            company_name = row.get('Company Name', '').strip()
            token = row.get('Token', '').strip()
            
            if company_name and company_name not in ['Company Name', 'By submitting this application']:
                submissions.append({
                    'company_name': company_name,
                    'token': token,
                    'row_data': row
                })
        
        print(f"Total submissions found: {len(submissions)}")
        print(f"\n=== FIRST 10 SUBMISSIONS WITH TOKENS ===")
        
        for i, submission in enumerate(submissions[:10], 1):
            print(f"{i:2d}. {submission['company_name']:<30} | Token: {submission['token']}")
        
        # Check for missing tokens
        missing_tokens = [s for s in submissions if not s['token']]
        if missing_tokens:
            print(f"\n=== SUBMISSIONS WITHOUT TOKENS ({len(missing_tokens)}) ===")
            for submission in missing_tokens:
                print(f"- {submission['company_name']}")
        
        # Check token format
        tokens = [s['token'] for s in submissions if s['token']]
        if tokens:
            print(f"\n=== TOKEN ANALYSIS ===")
            print(f"Total tokens: {len(tokens)}")
            print(f"Unique tokens: {len(set(tokens))}")
            print(f"Token length range: {min(len(t) for t in tokens)} - {max(len(t) for t in tokens)} characters")
            print(f"Sample tokens:")
            for token in tokens[:5]:
                print(f"  - {token}")
        
        # Show all available columns
        if submissions:
            print(f"\n=== AVAILABLE COLUMNS ===")
            columns = list(submissions[0]['row_data'].keys())
            for i, col in enumerate(columns, 1):
                print(f"{i:2d}. {col}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
