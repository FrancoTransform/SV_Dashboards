#!/usr/bin/env python3
"""
Debug the actual sync function to see why it's not detecting the 4 missing companies.
This replicates the exact logic from the sync_spreadsheet function.
"""

import json
import requests
import csv
from io import StringIO
from pathlib import Path
import re

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

def parse_csv_data(csv_content: str):
    """Parse CSV content into list of dictionaries"""
    submissions = []
    reader = csv.DictReader(StringIO(csv_content))
    
    for row in reader:
        # Skip empty rows or header-like rows
        company_name = row.get('Company Name', '').strip()
        if company_name and company_name not in ['Company Name', 'By submitting this application']:
            submissions.append(row)
    
    return submissions

def main():
    # Use the actual Google Sheets URL from the sync function
    sheet_url = 'https://docs.google.com/spreadsheets/d/1XA04fIaZI038hTnZAsX5L_BoDk45K2OID7O1ol1Aoxw/edit?pli=1&gid=1201695147#gid=1201695147'
    
    print("=== DEBUGGING LIVE SYNC FUNCTION ===\n")
    
    try:
        # Step 1: Fetch submissions (same as sync function)
        print("Step 1: Fetching submissions from Google Sheets...")
        csv_content = get_google_sheet_as_csv(sheet_url)
        submissions = parse_csv_data(csv_content)
        print(f"✅ Found {len(submissions)} submissions")
        
        # Step 2: Load token database (same as sync function)
        print("\nStep 2: Loading token database...")
        token_db_path = Path('token_database.json')
        if token_db_path.exists():
            with open(token_db_path, 'r', encoding='utf-8') as f:
                token_db = json.load(f)
            print(f"✅ Token database loaded")
        else:
            token_db = {'analyzed_tokens': {}, 'last_sync': None, 'total_submissions': 0, 'analyzed_count': 0}
            print("⚠️ Token database not found, using empty database")
        
        analyzed_tokens = set(token_db.get('analyzed_tokens', {}).keys())
        print(f"✅ Found {len(analyzed_tokens)} analyzed tokens")
        
        # Step 3: Find new companies (same logic as sync function)
        print("\nStep 3: Finding new companies...")
        new_companies = []
        for i, submission in enumerate(submissions):
            token = submission.get('Token', '').strip()
            company_name = submission.get('Company Name', '')
            
            if i < 5:  # Show first 5 for debugging
                print(f"  Checking: {company_name} | Token: {token} | In DB: {token in analyzed_tokens}")
            
            if token and token not in analyzed_tokens:
                new_companies.append(submission)
                print(f"🆕 Found new company: {company_name} (Token: {token})")
        
        print(f"\n✅ Found {len(new_companies)} new companies")
        
        # Step 4: Check if there are any new companies (same as sync function)
        print("\nStep 4: Checking sync logic...")
        if len(new_companies) == 0:
            print("❌ Sync would return 'Dashboard up to date' - NO ANALYSES GENERATED")
            print("This explains why you're seeing 'Generated 0 new analyses'")
        else:
            print(f"✅ Sync would process {len(new_companies)} companies")
            batch_size = min(5, len(new_companies))
            print(f"✅ Batch size: {batch_size}")
            
            print(f"\n=== COMPANIES TO BE PROCESSED ===")
            for i, submission in enumerate(new_companies[:batch_size], 1):
                company_name = submission.get('Company Name', '')
                token = submission.get('Token', '')
                print(f"{i}. {company_name} (Token: {token})")
        
        # Step 5: Debug token database contents
        print(f"\n=== TOKEN DATABASE ANALYSIS ===")
        print(f"Database file exists: {token_db_path.exists()}")
        print(f"Database keys: {list(token_db.keys())}")
        print(f"Analyzed tokens count: {len(analyzed_tokens)}")
        
        # Check if the expected missing tokens are in the database
        expected_missing_tokens = [
            'zizne9pl3c7vx7tap02zizne985h6dtb',  # RainyDayPal
            'x23yms941oje2pm2dx23yms94p0a5sp4',  # Counter Fin
            'gys0ihqi0kiiegys00vmvxl5knh8wr3l',  # BeSound
            '3ykdaow7clkp3ykc1fzfva06tx4jc1fn'   # LyfebloodDAO
        ]
        
        print(f"\n=== EXPECTED MISSING TOKEN CHECK ===")
        for token in expected_missing_tokens:
            in_db = token in analyzed_tokens
            print(f"Token {token}: {'❌ IN DATABASE (should be missing!)' if in_db else '✅ Missing from database (correct)'}")
        
        # Show some sample tokens from database
        print(f"\n=== SAMPLE TOKENS IN DATABASE ===")
        sample_tokens = list(analyzed_tokens)[:5]
        for token in sample_tokens:
            print(f"  - {token}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
