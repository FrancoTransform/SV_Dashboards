#!/usr/bin/env python3
"""
Google Sheets Sync Module for SemperVirens Accelerator
Syncs application data from Google Spreadsheet to local analysis files
"""

import os
import json
import csv
from pathlib import Path
from typing import List, Dict, Any
import requests
from datetime import datetime

# Project paths
PROJECT_ROOT = Path(__file__).parent
ANALYSIS_DIR = PROJECT_ROOT / "analysis"

def get_google_sheet_as_csv(sheet_url: str) -> str:
    """
    Convert Google Sheets URL to CSV export URL and fetch data
    
    Args:
        sheet_url: Google Sheets URL (view or edit link)
    
    Returns:
        CSV content as string
    """
    # Extract sheet ID from various Google Sheets URL formats
    if '/d/' in sheet_url:
        sheet_id = sheet_url.split('/d/')[1].split('/')[0]
    else:
        raise ValueError("Invalid Google Sheets URL format")
    
    # Convert to CSV export URL
    csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"
    
    print(f"Fetching data from: {csv_url}")
    
    try:
        response = requests.get(csv_url, timeout=30)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        raise Exception(f"Failed to fetch Google Sheet: {e}")

def parse_csv_data(csv_content: str) -> List[Dict[str, Any]]:
    """
    Parse CSV content into list of dictionaries
    
    Args:
        csv_content: Raw CSV content as string
    
    Returns:
        List of submission dictionaries
    """
    import io
    
    submissions = []
    csv_reader = csv.DictReader(io.StringIO(csv_content))
    
    for row in csv_reader:
        # Skip empty rows
        if not any(row.values()):
            continue
            
        # Clean up the data
        cleaned_row = {}
        for key, value in row.items():
            if key and value:  # Skip empty keys and values
                cleaned_row[key.strip()] = value.strip()
        
        if cleaned_row.get('Company Name'):  # Only include rows with company names
            submissions.append(cleaned_row)
    
    return submissions

def get_existing_companies() -> set:
    """
    Get set of companies that already have analysis files
    
    Returns:
        Set of company names (normalized)
    """
    existing = set()
    
    if not ANALYSIS_DIR.exists():
        return existing
    
    for analysis_file in ANALYSIS_DIR.glob('*_analysis.json'):
        try:
            with open(analysis_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                company_name = data.get('company_name', '')
                if company_name:
                    existing.add(normalize_company_name(company_name))
        except Exception as e:
            print(f"Error reading {analysis_file}: {e}")
    
    return existing

def normalize_company_name(name: str) -> str:
    """
    Normalize company name for comparison
    
    Args:
        name: Company name
    
    Returns:
        Normalized name (lowercase, no spaces/punctuation)
    """
    import re
    return re.sub(r'[^a-z0-9]', '', name.lower())

def sync_with_google_sheet(sheet_url: str) -> Dict[str, Any]:
    """
    Sync with Google Spreadsheet and return summary
    
    Args:
        sheet_url: Google Sheets URL
    
    Returns:
        Sync summary dictionary
    """
    try:
        print("Starting Google Sheets sync...")
        
        # Fetch CSV data
        csv_content = get_google_sheet_as_csv(sheet_url)
        submissions = parse_csv_data(csv_content)
        
        print(f"Found {len(submissions)} submissions in spreadsheet")
        
        # Get existing companies
        existing_companies = get_existing_companies()
        print(f"Found {len(existing_companies)} existing analysis files")
        
        # Find new companies
        new_companies = []
        for submission in submissions:
            company_name = submission.get('Company Name', '')
            normalized_name = normalize_company_name(company_name)
            
            if normalized_name not in existing_companies:
                new_companies.append(submission)
        
        print(f"Found {len(new_companies)} new companies to process")
        
        # Save new submissions to a temporary file for processing
        if new_companies:
            temp_file = PROJECT_ROOT / "temp_new_submissions.json"
            with open(temp_file, 'w', encoding='utf-8') as f:
                json.dump(new_companies, f, indent=2)
            print(f"Saved new submissions to {temp_file}")
        
        return {
            'status': 'success',
            'total_in_sheet': len(submissions),
            'existing_analyses': len(existing_companies),
            'new_companies': len(new_companies),
            'new_company_names': [c.get('Company Name', 'Unknown') for c in new_companies],
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }

if __name__ == "__main__":
    # Test with a sample URL (replace with actual spreadsheet URL)
    test_url = "https://docs.google.com/spreadsheets/d/1example/edit"
    result = sync_with_google_sheet(test_url)
    print(json.dumps(result, indent=2))
