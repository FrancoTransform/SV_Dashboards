#!/usr/bin/env python3
"""
Check for missing companies by comparing Google Sheets data with analysis files.
"""

import json
import os
from pathlib import Path

def get_companies_from_analysis_files():
    """Get list of companies from comprehensive analysis files"""
    analysis_dir = Path("analysis")
    companies = []
    
    for file_path in analysis_dir.glob('*_comprehensive_analysis.json'):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                company_name = data.get('company_name', '')
                if company_name:
                    companies.append(company_name.strip())
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    
    return sorted(companies)

def get_companies_from_sheets():
    """Get companies from Google Sheets (if accessible)"""
    # This would need the actual Google Sheets URL and access
    # For now, let's return the count you mentioned
    return 69  # You mentioned 69 companies in spreadsheet

def main():
    print("=== COMPANY COUNT ANALYSIS ===\n")
    
    # Get companies from analysis files
    analysis_companies = get_companies_from_analysis_files()
    
    print(f"Companies in comprehensive analysis files: {len(analysis_companies)}")
    print(f"Companies in Google Sheets (reported): {get_companies_from_sheets()}")
    print(f"Difference: {get_companies_from_sheets() - len(analysis_companies)}")
    
    print(f"\n=== COMPANIES IN ANALYSIS FILES ===")
    for i, company in enumerate(analysis_companies, 1):
        print(f"{i:2d}. {company}")
    
    # Check for any legacy analysis files that might not have comprehensive versions
    legacy_dir = Path("analysis/legacy")
    if legacy_dir.exists():
        print(f"\n=== LEGACY ANALYSIS FILES ===")
        legacy_files = list(legacy_dir.glob('*_analysis.json'))
        print(f"Legacy files count: {len(legacy_files)}")
        
        legacy_companies = []
        for file_path in legacy_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    company_name = data.get('company_name', '')
                    if company_name:
                        legacy_companies.append(company_name.strip())
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
        
        # Find companies in legacy but not in comprehensive
        missing_from_comprehensive = set(legacy_companies) - set(analysis_companies)
        if missing_from_comprehensive:
            print(f"\n=== COMPANIES IN LEGACY BUT NOT COMPREHENSIVE ===")
            for company in sorted(missing_from_comprehensive):
                print(f"- {company}")
    
    # Check for any remaining analysis files in main directory
    main_analysis_files = list(Path("analysis").glob('*_analysis.json'))
    if main_analysis_files:
        print(f"\n=== REMAINING LEGACY FILES IN MAIN DIRECTORY ===")
        for file_path in main_analysis_files:
            print(f"- {file_path.name}")

if __name__ == "__main__":
    main()
