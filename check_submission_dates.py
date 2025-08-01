#!/usr/bin/env python3
"""
Check the submission dates in Google Sheets to understand the format.
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
    
    print("=== CHECKING SUBMISSION DATES ===\n")
    
    try:
        # Fetch data from Google Sheets
        csv_content = get_google_sheet_as_csv(sheet_url)
        reader = csv.DictReader(StringIO(csv_content))
        
        submissions = []
        for row in reader:
            company_name = row.get('Company Name', '').strip()
            submitted_at = row.get('Submitted At', '').strip()
            token = row.get('Token', '').strip()
            
            if company_name and company_name not in ['Company Name', 'By submitting this application']:
                submissions.append({
                    'company_name': company_name,
                    'submitted_at': submitted_at,
                    'token': token
                })
        
        print(f"Total submissions found: {len(submissions)}")
        print(f"\n=== FIRST 10 SUBMISSIONS WITH DATES ===")
        
        for i, submission in enumerate(submissions[:10], 1):
            print(f"{i:2d}. {submission['company_name']:<30} | Submitted: {submission['submitted_at']}")
        
        # Check for missing submission dates
        missing_dates = [s for s in submissions if not s['submitted_at']]
        if missing_dates:
            print(f"\n=== SUBMISSIONS WITHOUT DATES ({len(missing_dates)}) ===")
            for submission in missing_dates:
                print(f"- {submission['company_name']}")
        
        # Check date format
        dates = [s['submitted_at'] for s in submissions if s['submitted_at']]
        if dates:
            print(f"\n=== DATE ANALYSIS ===")
            print(f"Total dates: {len(dates)}")
            print(f"Sample dates:")
            for date in dates[:5]:
                print(f"  - {date}")
        
        # Check if we have dates for the 4 newly added companies
        new_companies = ['RainyDayPal', 'Counter Fin', 'BeSound', 'LyfebloodDAO']
        print(f"\n=== NEW COMPANIES SUBMISSION DATES ===")
        for company in new_companies:
            found = False
            for submission in submissions:
                if submission['company_name'] == company:
                    print(f"✅ {company}: {submission['submitted_at']}")
                    found = True
                    break
            if not found:
                print(f"❌ {company}: Not found")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
