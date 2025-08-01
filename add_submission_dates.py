#!/usr/bin/env python3
"""
Add submission dates to all existing comprehensive analysis files.
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
    
    print("=== ADDING SUBMISSION DATES TO COMPREHENSIVE ANALYSES ===\n")
    
    try:
        # Fetch data from Google Sheets
        print("Fetching data from Google Sheets...")
        csv_content = get_google_sheet_as_csv(sheet_url)
        reader = csv.DictReader(StringIO(csv_content))
        
        # Build submission date lookup by company name and token
        date_lookup_by_name = {}
        date_lookup_by_token = {}
        
        for row in reader:
            company_name = row.get('Company Name', '').strip()
            submitted_at = row.get('Submitted At', '').strip()
            token = row.get('Token', '').strip()
            
            if company_name and company_name not in ['Company Name', 'By submitting this application']:
                normalized_name = normalize_company_name(company_name)
                date_lookup_by_name[normalized_name] = {
                    'submitted_at': submitted_at,
                    'company_name': company_name
                }
                if token:
                    date_lookup_by_token[token] = {
                        'submitted_at': submitted_at,
                        'company_name': company_name
                    }
        
        print(f"Found {len(date_lookup_by_name)} companies with submission dates")
        
        # Update all comprehensive analysis files
        analysis_dir = Path("analysis")
        updated_count = 0
        missing_dates = []
        
        for file_path in analysis_dir.glob('*_comprehensive_analysis.json'):
            try:
                # Load existing analysis
                with open(file_path, 'r', encoding='utf-8') as f:
                    analysis = json.load(f)
                
                company_name = analysis.get('company_name', '')
                token = analysis.get('token', '')
                
                # Check if submission date already exists
                if analysis.get('submitted_at'):
                    print(f"⏭️  Skipping {company_name} - already has submission date")
                    continue
                
                # Try to find submission date by token first, then by name
                submitted_at = None
                if token and token in date_lookup_by_token:
                    submitted_at = date_lookup_by_token[token]['submitted_at']
                    print(f"✅ Found date by token for {company_name}: {submitted_at}")
                elif company_name:
                    normalized_name = normalize_company_name(company_name)
                    if normalized_name in date_lookup_by_name:
                        submitted_at = date_lookup_by_name[normalized_name]['submitted_at']
                        print(f"✅ Found date by name for {company_name}: {submitted_at}")
                
                if submitted_at:
                    # Add submission date to analysis
                    analysis['submitted_at'] = submitted_at
                    
                    # Save updated analysis
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(analysis, f, indent=2, ensure_ascii=False)
                    
                    updated_count += 1
                    print(f"💾 Updated {file_path.name}")
                else:
                    missing_dates.append({
                        'file': file_path.name,
                        'company_name': company_name,
                        'token': token
                    })
                    print(f"❌ No date found for {company_name}")
            
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
        
        print(f"\n=== SUMMARY ===")
        print(f"Total comprehensive analysis files: {len(list(analysis_dir.glob('*_comprehensive_analysis.json')))}")
        print(f"Files updated with submission dates: {updated_count}")
        print(f"Files missing submission dates: {len(missing_dates)}")
        
        if missing_dates:
            print(f"\n=== FILES MISSING DATES ===")
            for missing in missing_dates:
                print(f"- {missing['company_name']} ({missing['file']})")
        
        print(f"\n✅ Submission dates added to comprehensive analyses")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
