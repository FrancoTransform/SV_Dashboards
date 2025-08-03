#!/usr/bin/env python3
"""
Add tokens to all existing comprehensive analysis files that are missing them.
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
    
    print("=== ADDING TOKENS TO ANALYSIS FILES ===\n")
    
    try:
        # 1. Get token lookup from Google Sheets
        print("1. Building token lookup from Google Sheets...")
        csv_content = get_google_sheet_as_csv(sheet_url)
        reader = csv.DictReader(StringIO(csv_content))
        
        token_lookup = {}
        for row in reader:
            company_name = row.get('Company Name', '').strip()
            token = row.get('Token', '').strip()
            
            if company_name and company_name not in ['Company Name', 'By submitting this application']:
                normalized_name = normalize_company_name(company_name)
                token_lookup[normalized_name] = {
                    'token': token,
                    'company_name': company_name
                }
        
        print(f"✅ Built lookup for {len(token_lookup)} companies")
        
        # 2. Process all comprehensive analysis files
        print("\n2. Processing analysis files...")
        analysis_dir = Path("analysis")
        updated_count = 0
        already_have_tokens = 0
        no_match_found = 0
        
        for file_path in analysis_dir.glob('*_comprehensive_analysis.json'):
            try:
                # Load analysis file
                with open(file_path, 'r', encoding='utf-8') as f:
                    analysis = json.load(f)
                
                company_name = analysis.get('company_name', '')
                existing_token = analysis.get('token', '')
                
                # Skip if already has token
                if existing_token:
                    already_have_tokens += 1
                    print(f"⏭️  {company_name} - already has token")
                    continue
                
                # Find token for this company
                normalized_name = normalize_company_name(company_name)
                if normalized_name in token_lookup:
                    token_info = token_lookup[normalized_name]
                    token = token_info['token']
                    
                    # Add token to analysis
                    analysis['token'] = token
                    
                    # Save updated analysis
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(analysis, f, indent=2, ensure_ascii=False)
                    
                    updated_count += 1
                    print(f"✅ {company_name} - added token: {token}")
                else:
                    no_match_found += 1
                    print(f"❌ {company_name} - no token found in Google Sheets")
            
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
        
        print(f"\n=== SUMMARY ===")
        print(f"Files already with tokens: {already_have_tokens}")
        print(f"Files updated with tokens: {updated_count}")
        print(f"Files with no matching token: {no_match_found}")
        print(f"Total files processed: {already_have_tokens + updated_count + no_match_found}")
        
        # 3. Verify final count
        print(f"\n3. Verifying token coverage...")
        files_with_tokens = 0
        for file_path in analysis_dir.glob('*_comprehensive_analysis.json'):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    analysis = json.load(f)
                    if analysis.get('token'):
                        files_with_tokens += 1
            except Exception:
                pass
        
        print(f"✅ Final count: {files_with_tokens} analysis files now have tokens")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
