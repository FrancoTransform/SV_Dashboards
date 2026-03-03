#!/usr/bin/env python3
"""Batch generate comprehensive analyses for all Cohort 3 companies (Aug 20 2025 - Jan 15 2026)."""

import sys
import os
import csv
import json
import re
import time
import requests
from io import StringIO
from datetime import datetime
from pathlib import Path

# Load env vars
from dotenv import load_dotenv
load_dotenv()

# Import the analysis function from sva.py
# We need to suppress Flask startup noise
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sva import generate_comprehensive_analysis, ANALYSIS_DIR

SHEET_URL = 'https://docs.google.com/spreadsheets/d/1XA04fIaZI038hTnZAsX5L_BoDk45K2OID7O1ol1Aoxw/edit?pli=1&gid=1201695147#gid=1201695147'
COHORT3_START = datetime(2025, 8, 20)
COHORT3_END = datetime(2026, 1, 16)  # inclusive of Jan 15
DATE_FORMATS = ['%Y-%m-%d %H:%M:%S', '%m/%d/%Y %H:%M:%S', '%Y-%m-%dT%H:%M:%S', '%m/%d/%Y %H:%M']


def get_csv_data():
    sheet_id = SHEET_URL.split('/d/')[1].split('/')[0]
    csv_url = f'https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv'
    response = requests.get(csv_url, timeout=30)
    response.raise_for_status()
    return response.text


def parse_date(date_str):
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    return None


def get_safe_filename(company_name):
    """Match the exact filename logic from sva.py sync_spreadsheet"""
    return re.sub(r'[^a-z0-9]', '', company_name.lower())


def main():
    print("=" * 60)
    print("COHORT 3 BATCH ANALYSIS GENERATOR")
    print("=" * 60)

    # 1. Fetch spreadsheet data
    print("\n📥 Fetching spreadsheet data...")
    csv_content = get_csv_data()
    reader = csv.DictReader(StringIO(csv_content))

    # 2. Filter to Cohort 3
    cohort3 = []
    for row in reader:
        name = row.get('Company Name', '').strip()
        date_str = row.get('Submitted At', '').strip()
        if not name or name in ['Company Name', 'By submitting this application']:
            continue
        dt = parse_date(date_str)
        if dt and COHORT3_START <= dt < COHORT3_END:
            cohort3.append(row)

    print(f"📊 Found {len(cohort3)} Cohort 3 companies")

    # 3. Check which already have analysis files
    existing = {f.name for f in ANALYSIS_DIR.glob('*_comprehensive_analysis.json')}
    to_process = []
    for row in cohort3:
        name = row.get('Company Name', '')
        safe = get_safe_filename(name)
        filename = f"{safe}_comprehensive_analysis.json"
        if filename not in existing:
            to_process.append(row)
        else:
            print(f"  ⏭️  Skipping {name} (already has analysis)")

    print(f"\n🔄 Need to generate analyses for {len(to_process)} companies")
    if not to_process:
        print("✅ All Cohort 3 companies already have analyses!")
        return

    # 4. Auto-proceed (confirmation removed for batch execution)
    print(f"\n⚠️  Making {len(to_process)} OpenAI API calls (gpt-4o)...")
    print("Starting in 3 seconds...")
    time.sleep(3)

    # 5. Process each company
    success = 0
    failed = []
    token_db_path = Path('token_database.json')

    for i, row in enumerate(to_process, 1):
        name = row.get('Company Name', '')
        token = row.get('Token', '')
        print(f"\n[{i}/{len(to_process)}] 🔄 Analyzing: {name}")

        try:
            analysis = generate_comprehensive_analysis(row)
            safe = get_safe_filename(name)
            filepath = ANALYSIS_DIR / f"{safe}_comprehensive_analysis.json"
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(analysis, f, indent=2)
            print(f"  ✅ Saved: {filepath.name}")
            success += 1

            # Update token database
            if token and token_db_path.exists():
                try:
                    with open(token_db_path, 'r') as f:
                        token_db = json.load(f)
                    token_db['analyzed_tokens'][token] = {
                        'company_name': name,
                        'analysis_file': f"{safe}_comprehensive_analysis.json",
                        'analyzed_at': datetime.now().isoformat()
                    }
                    token_db['analyzed_count'] = len(token_db['analyzed_tokens'])
                    with open(token_db_path, 'w') as f:
                        json.dump(token_db, f, indent=2, ensure_ascii=False)
                except Exception:
                    pass  # Non-critical

            # Small delay to avoid rate limiting
            if i < len(to_process):
                time.sleep(1)

        except Exception as e:
            print(f"  ❌ Failed: {e}")
            failed.append((name, str(e)))

    # 6. Summary
    print("\n" + "=" * 60)
    print(f"✅ Successfully generated: {success}/{len(to_process)}")
    if failed:
        print(f"❌ Failed: {len(failed)}")
        for name, err in failed:
            print(f"   - {name}: {err}")
    print("=" * 60)


if __name__ == '__main__':
    main()

