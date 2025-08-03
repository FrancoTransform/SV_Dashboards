#!/usr/bin/env python3
"""
Find the exact discrepancy between 73 analysis files and 74 tokens.
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

def normalize_company_name(name):
    """Normalize company name for comparison"""
    return re.sub(r'[^a-z0-9]', '', name.lower())

def main():
    sheet_url = 'https://docs.google.com/spreadsheets/d/1XA04fIaZI038hTnZAsX5L_BoDk45K2OID7O1ol1Aoxw/edit?pli=1&gid=1201695147#gid=1201695147'
    
    print("=== FINDING MISSING ANALYSIS FILE ===\n")
    
    try:
        # 1. Get all companies from Google Sheets
        print("1. Fetching Google Sheets data...")
        csv_content = get_google_sheet_as_csv(sheet_url)
        reader = csv.DictReader(StringIO(csv_content))
        
        sheets_companies = {}
        for row in reader:
            company_name = row.get('Company Name', '').strip()
            token = row.get('Token', '').strip()
            
            if company_name and company_name not in ['Company Name', 'By submitting this application']:
                sheets_companies[token] = {
                    'company_name': company_name,
                    'token': token,
                    'submitted_at': row.get('Submitted At', '').strip()
                }
        
        print(f"✅ Google Sheets: {len(sheets_companies)} companies")
        
        # 2. Get all companies from analysis files
        print("\n2. Checking analysis files...")
        analysis_dir = Path("analysis")
        file_companies = {}
        
        for file_path in analysis_dir.glob('*_comprehensive_analysis.json'):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    analysis = json.load(f)
                    company_name = analysis.get('company_name', '')
                    token = analysis.get('token', '')
                    
                    if company_name and token:
                        file_companies[token] = {
                            'company_name': company_name,
                            'token': token,
                            'file_name': file_path.name
                        }
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
        
        print(f"✅ Analysis files: {len(file_companies)} companies")
        
        # 3. Get all companies from token database
        print("\n3. Checking token database...")
        token_db_path = Path('token_database.json')
        if token_db_path.exists():
            with open(token_db_path, 'r', encoding='utf-8') as f:
                token_db = json.load(f)
            db_companies = token_db.get('analyzed_tokens', {})
            print(f"✅ Token database: {len(db_companies)} companies")
        else:
            print("❌ Token database not found")
            db_companies = {}
        
        # 4. Find discrepancies
        print(f"\n=== DISCREPANCY ANALYSIS ===")
        
        sheets_tokens = set(sheets_companies.keys())
        file_tokens = set(file_companies.keys())
        db_tokens = set(db_companies.keys())
        
        print(f"Google Sheets tokens: {len(sheets_tokens)}")
        print(f"Analysis file tokens: {len(file_tokens)}")
        print(f"Database tokens: {len(db_tokens)}")
        
        # Find tokens in sheets but not in files
        missing_files = sheets_tokens - file_tokens
        if missing_files:
            print(f"\n❌ TOKENS IN SHEETS BUT NO ANALYSIS FILE ({len(missing_files)}):")
            for token in missing_files:
                company = sheets_companies[token]
                print(f"  - {company['company_name']} (Token: {token})")
        
        # Find tokens in database but not in files
        db_missing_files = db_tokens - file_tokens
        if db_missing_files:
            print(f"\n❌ TOKENS IN DATABASE BUT NO ANALYSIS FILE ({len(db_missing_files)}):")
            for token in db_missing_files:
                if token in db_companies:
                    company_name = db_companies[token].get('company_name', 'Unknown')
                    print(f"  - {company_name} (Token: {token})")
        
        # Find tokens in files but not in database
        file_missing_db = file_tokens - db_tokens
        if file_missing_db:
            print(f"\n⚠️  TOKENS IN FILES BUT NOT IN DATABASE ({len(file_missing_db)}):")
            for token in file_missing_db:
                company = file_companies[token]
                print(f"  - {company['company_name']} (Token: {token}, File: {company['file_name']})")
        
        # Find tokens in files but not in sheets
        file_missing_sheets = file_tokens - sheets_tokens
        if file_missing_sheets:
            print(f"\n⚠️  TOKENS IN FILES BUT NOT IN SHEETS ({len(file_missing_sheets)}):")
            for token in file_missing_sheets:
                company = file_companies[token]
                print(f"  - {company['company_name']} (Token: {token}, File: {company['file_name']})")
        
        # Check for duplicate company names
        print(f"\n=== DUPLICATE ANALYSIS CHECK ===")
        company_names_in_files = {}
        for token, company in file_companies.items():
            name = company['company_name']
            if name in company_names_in_files:
                print(f"⚠️  DUPLICATE: {name}")
                print(f"    File 1: {company_names_in_files[name]['file_name']} (Token: {company_names_in_files[name]['token']})")
                print(f"    File 2: {company['file_name']} (Token: {token})")
            else:
                company_names_in_files[name] = company
        
        if not missing_files and not db_missing_files and not file_missing_db and not file_missing_sheets:
            print("\n✅ NO DISCREPANCIES FOUND")
            print("The 73 vs 74 difference might be due to:")
            print("1. A company with multiple submissions (same company, different tokens)")
            print("2. A test submission that was filtered out")
            print("3. A submission that was deleted from Google Sheets")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
