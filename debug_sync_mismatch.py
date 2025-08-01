#!/usr/bin/env python3
"""
Debug script to identify why sync is not detecting missing companies.
Compare Google Sheets data with existing comprehensive analyses.
"""

import json
import re
import requests
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

def parse_csv_data(csv_content: str):
    """Parse CSV content into list of dictionaries"""
    import csv
    from io import StringIO
    
    submissions = []
    reader = csv.DictReader(StringIO(csv_content))
    
    for row in reader:
        # Skip empty rows or header-like rows
        company_name = row.get('Company Name', '').strip()
        if company_name and company_name not in ['Company Name', 'By submitting this application']:
            submissions.append(row)
    
    return submissions

def normalize_company_name(name):
    """Normalize company name for comparison (same logic as sync function)"""
    return re.sub(r'[^a-z0-9]', '', name.lower())

def get_existing_companies():
    """Get existing companies from comprehensive analysis files"""
    analysis_dir = Path("analysis")
    existing_companies = set()
    existing_details = []
    
    for file in analysis_dir.glob('*_comprehensive_analysis.json'):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                company_name = data.get('company_name', '')
                if company_name:
                    normalized_name = normalize_company_name(company_name)
                    existing_companies.add(normalized_name)
                    existing_details.append({
                        'original_name': company_name,
                        'normalized_name': normalized_name,
                        'filename': file.name
                    })
        except Exception as e:
            print(f"Error reading {file}: {e}")
            continue
    
    return existing_companies, existing_details

def main():
    # Google Sheets URL
    sheet_url = 'https://docs.google.com/spreadsheets/d/1XA04fIaZI038hTnZAsX5L_BoDk45K2OID7O1ol1Aoxw/edit?pli=1&gid=1201695147#gid=1201695147'
    
    print("=== DEBUGGING SYNC MISMATCH ===\n")
    
    try:
        # Fetch data from Google Sheets
        print("Fetching data from Google Sheets...")
        csv_content = get_google_sheet_as_csv(sheet_url)
        submissions = parse_csv_data(csv_content)
        
        print(f"Found {len(submissions)} companies in Google Sheets")
        
        # Get existing companies
        existing_companies, existing_details = get_existing_companies()
        print(f"Found {len(existing_companies)} existing comprehensive analyses")
        
        # Normalize Google Sheets companies
        sheets_companies = []
        for submission in submissions:
            company_name = submission.get('Company Name', '')
            normalized_name = normalize_company_name(company_name)
            sheets_companies.append({
                'original_name': company_name,
                'normalized_name': normalized_name,
                'submission_data': submission
            })
        
        # Find missing companies
        missing_companies = []
        for company in sheets_companies:
            if company['normalized_name'] not in existing_companies:
                missing_companies.append(company)
        
        print(f"\n=== SUMMARY ===")
        print(f"Google Sheets companies: {len(sheets_companies)}")
        print(f"Existing analyses: {len(existing_companies)}")
        print(f"Missing companies: {len(missing_companies)}")
        
        if missing_companies:
            print(f"\n=== MISSING COMPANIES ({len(missing_companies)}) ===")
            for i, company in enumerate(missing_companies, 1):
                print(f"{i}. {company['original_name']} -> {company['normalized_name']}")
        
        # Check for potential duplicates or near matches
        print(f"\n=== POTENTIAL ISSUES ===")
        
        # Check for companies in sheets that might have slight name differences
        for missing in missing_companies:
            missing_norm = missing['normalized_name']
            for existing in existing_details:
                existing_norm = existing['normalized_name']
                
                # Check for partial matches
                if missing_norm in existing_norm or existing_norm in missing_norm:
                    print(f"POTENTIAL MATCH: '{missing['original_name']}' ({missing_norm}) might match '{existing['original_name']}' ({existing_norm})")
        
        # Show first few companies from each source for comparison
        print(f"\n=== FIRST 10 GOOGLE SHEETS COMPANIES ===")
        for i, company in enumerate(sheets_companies[:10], 1):
            print(f"{i:2d}. {company['original_name']} -> {company['normalized_name']}")
        
        print(f"\n=== FIRST 10 EXISTING ANALYSES ===")
        for i, company in enumerate(sorted(existing_details, key=lambda x: x['original_name'])[:10], 1):
            print(f"{i:2d}. {company['original_name']} -> {company['normalized_name']}")
        
        # Check if there are any empty or problematic company names
        print(f"\n=== DATA QUALITY CHECKS ===")
        empty_names = [s for s in submissions if not s.get('Company Name', '').strip()]
        if empty_names:
            print(f"Found {len(empty_names)} submissions with empty company names")
        
        # Check for very short normalized names that might cause issues
        short_names = [c for c in sheets_companies if len(c['normalized_name']) < 3]
        if short_names:
            print(f"Found {len(short_names)} companies with very short normalized names:")
            for company in short_names:
                print(f"  - '{company['original_name']}' -> '{company['normalized_name']}'")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
