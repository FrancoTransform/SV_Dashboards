#!/usr/bin/env python3
"""
Populate the token database by matching existing comprehensive analyses with Google Sheets tokens.
"""

import json
import requests
import csv
from io import StringIO
from pathlib import Path
import re
from datetime import datetime

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
    
    print("=== POPULATING TOKEN DATABASE ===\n")
    
    try:
        # Fetch data from Google Sheets
        print("Fetching data from Google Sheets...")
        csv_content = get_google_sheet_as_csv(sheet_url)
        reader = csv.DictReader(StringIO(csv_content))
        
        # Build token lookup by company name
        token_lookup = {}
        submissions_by_token = {}
        
        for row in reader:
            company_name = row.get('Company Name', '').strip()
            token = row.get('Token', '').strip()
            
            if company_name and company_name not in ['Company Name', 'By submitting this application'] and token:
                normalized_name = normalize_company_name(company_name)
                token_lookup[normalized_name] = {
                    'token': token,
                    'company_name': company_name,
                    'submission_data': row
                }
                submissions_by_token[token] = {
                    'company_name': company_name,
                    'normalized_name': normalized_name,
                    'submission_data': row
                }
        
        print(f"Found {len(token_lookup)} companies with tokens in Google Sheets")
        
        # Load existing comprehensive analyses
        analysis_dir = Path("analysis")
        analyzed_tokens = {}
        matched_count = 0
        unmatched_analyses = []
        
        for file in analysis_dir.glob('*_comprehensive_analysis.json'):
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    company_name = data.get('company_name', '')
                    
                    if company_name:
                        normalized_name = normalize_company_name(company_name)
                        
                        # Try to find matching token
                        if normalized_name in token_lookup:
                            token_info = token_lookup[normalized_name]
                            token = token_info['token']
                            
                            analyzed_tokens[token] = {
                                'company_name': company_name,
                                'analysis_file': file.name,
                                'matched_at': datetime.now().isoformat(),
                                'google_sheets_name': token_info['company_name']
                            }
                            matched_count += 1
                            print(f"✅ Matched: {company_name} -> {token}")
                        else:
                            unmatched_analyses.append({
                                'company_name': company_name,
                                'normalized_name': normalized_name,
                                'file': file.name
                            })
                            print(f"❌ No match: {company_name} ({normalized_name})")
            
            except Exception as e:
                print(f"Error reading {file}: {e}")
        
        # Create token database
        token_database = {
            'analyzed_tokens': analyzed_tokens,
            'last_sync': datetime.now().isoformat(),
            'total_submissions': len(submissions_by_token),
            'analyzed_count': len(analyzed_tokens),
            'unmatched_analyses': unmatched_analyses
        }
        
        # Save token database
        with open('token_database.json', 'w', encoding='utf-8') as f:
            json.dump(token_database, f, indent=2, ensure_ascii=False)
        
        print(f"\n=== SUMMARY ===")
        print(f"Total submissions in Google Sheets: {len(submissions_by_token)}")
        print(f"Total comprehensive analyses: {len(list(analysis_dir.glob('*_comprehensive_analysis.json')))}")
        print(f"Successfully matched: {matched_count}")
        print(f"Unmatched analyses: {len(unmatched_analyses)}")
        print(f"Missing analyses: {len(submissions_by_token) - len(analyzed_tokens)}")
        
        if unmatched_analyses:
            print(f"\n=== UNMATCHED ANALYSES ===")
            for analysis in unmatched_analyses:
                print(f"- {analysis['company_name']} ({analysis['file']})")
        
        # Find missing tokens (submissions without analyses)
        missing_tokens = []
        for token, submission in submissions_by_token.items():
            if token not in analyzed_tokens:
                missing_tokens.append({
                    'token': token,
                    'company_name': submission['company_name']
                })
        
        if missing_tokens:
            print(f"\n=== MISSING ANALYSES ({len(missing_tokens)}) ===")
            for missing in missing_tokens:
                print(f"- {missing['company_name']} (Token: {missing['token']})")
        
        print(f"\n✅ Token database saved to token_database.json")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
