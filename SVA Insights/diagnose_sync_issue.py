#!/usr/bin/env python3
"""
Diagnose the sync issue: 74 submissions in Google Sheets vs 71 displayed companies.
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
    
    print("=== DIAGNOSING SYNC DISCREPANCY ===\n")
    
    try:
        # 1. Check Google Sheets submissions
        print("1. Fetching Google Sheets data...")
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
                    'submitted_at': row.get('Submitted At', '').strip()
                })
        
        print(f"✅ Google Sheets: {len(submissions)} submissions")
        
        # 2. Check local comprehensive analysis files
        print("\n2. Checking local comprehensive analysis files...")
        analysis_dir = Path("analysis")
        analysis_files = list(analysis_dir.glob('*_comprehensive_analysis.json'))
        print(f"✅ Local files: {len(analysis_files)} comprehensive analysis files")
        
        # 3. Check token database
        print("\n3. Checking token database...")
        token_db_path = Path('token_database.json')
        if token_db_path.exists():
            with open(token_db_path, 'r', encoding='utf-8') as f:
                token_db = json.load(f)
            analyzed_tokens = set(token_db.get('analyzed_tokens', {}).keys())
            print(f"✅ Token database: {len(analyzed_tokens)} analyzed tokens")
        else:
            print("❌ Token database not found")
            analyzed_tokens = set()
        
        # 4. Find missing companies
        print("\n4. Finding missing companies...")
        missing_companies = []
        for submission in submissions:
            token = submission['token']
            if token and token not in analyzed_tokens:
                missing_companies.append(submission)
        
        print(f"🔍 Missing companies: {len(missing_companies)}")
        
        if missing_companies:
            print("\n=== MISSING COMPANIES ===")
            for i, company in enumerate(missing_companies, 1):
                print(f"{i:2d}. {company['company_name']:<30} | Token: {company['token']} | Submitted: {company['submitted_at']}")
        
        # 5. Check for companies in token DB but not in analysis files
        print("\n5. Checking for token DB vs analysis file discrepancies...")
        analysis_company_names = set()
        for file_path in analysis_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    analysis = json.load(f)
                    company_name = analysis.get('company_name', '')
                    if company_name:
                        analysis_company_names.add(company_name)
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
        
        # Find companies in token DB but missing analysis files
        token_companies = set()
        for token, info in token_db.get('analyzed_tokens', {}).items():
            company_name = info.get('company_name', '')
            if company_name:
                token_companies.add(company_name)
        
        missing_files = token_companies - analysis_company_names
        if missing_files:
            print(f"⚠️  Companies in token DB but missing analysis files: {len(missing_files)}")
            for company in missing_files:
                print(f"  - {company}")
        else:
            print("✅ All token DB companies have analysis files")
        
        # 6. Summary
        print(f"\n=== SUMMARY ===")
        print(f"Google Sheets submissions: {len(submissions)}")
        print(f"Local analysis files: {len(analysis_files)}")
        print(f"Token database entries: {len(analyzed_tokens)}")
        print(f"Missing analyses needed: {len(missing_companies)}")
        print(f"Companies in DB but missing files: {len(missing_files)}")
        
        # 7. Check if the 3 newest submissions are the missing ones
        print(f"\n=== NEWEST SUBMISSIONS ===")
        # Sort by submitted date (newest first)
        submissions_with_dates = [s for s in submissions if s['submitted_at']]
        submissions_with_dates.sort(key=lambda x: x['submitted_at'], reverse=True)
        
        print("5 most recent submissions:")
        for i, submission in enumerate(submissions_with_dates[:5], 1):
            token = submission['token']
            status = "✅ Analyzed" if token in analyzed_tokens else "❌ Missing"
            print(f"{i}. {submission['company_name']:<30} | {submission['submitted_at']} | {status}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
