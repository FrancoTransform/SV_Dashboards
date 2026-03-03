#!/usr/bin/env python3
"""Check which companies from the spreadsheet fall into Cohort 3 (Aug 20 2025 - Jan 15 2026)."""

import requests
import csv
from io import StringIO
from datetime import datetime
from pathlib import Path

def main():
    sheet_url = 'https://docs.google.com/spreadsheets/d/1XA04fIaZI038hTnZAsX5L_BoDk45K2OID7O1ol1Aoxw/edit?pli=1&gid=1201695147#gid=1201695147'
    sheet_id = sheet_url.split('/d/')[1].split('/')[0]
    csv_url = f'https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv'

    print("Fetching spreadsheet data...")
    response = requests.get(csv_url, timeout=30)
    reader = csv.DictReader(StringIO(response.text))

    cohort3_start = datetime(2025, 8, 20)
    cohort3_end = datetime(2026, 1, 16)  # inclusive of Jan 15

    all_subs = []
    for row in reader:
        name = row.get('Company Name', '').strip()
        date_str = row.get('Submitted At', '').strip()
        token = row.get('Token', '').strip()
        if name and name not in ['Company Name', 'By submitting this application']:
            all_subs.append({'name': name, 'date_str': date_str, 'token': token, 'row': row})

    print(f"Total submissions in spreadsheet: {len(all_subs)}")

    # Parse dates and find Cohort 3 companies
    date_formats = ['%Y-%m-%d %H:%M:%S', '%m/%d/%Y %H:%M:%S', '%Y-%m-%dT%H:%M:%S', '%m/%d/%Y %H:%M']
    cohort3 = []
    for sub in all_subs:
        dt = None
        for fmt in date_formats:
            try:
                dt = datetime.strptime(sub['date_str'], fmt)
                break
            except ValueError:
                continue
        if dt and cohort3_start <= dt < cohort3_end:
            cohort3.append(sub)

    print(f"\n=== COHORT 3 COMPANIES (Aug 20 2025 - Jan 15 2026): {len(cohort3)} ===")
    for sub in cohort3:
        print(f"  {sub['name']} | Submitted: {sub['date_str']} | Token: {sub['token'][:20]}...")

    # Check which already have analysis files
    analysis_dir = Path('analysis')
    existing = {f.name for f in analysis_dir.glob('*_comprehensive_analysis.json')}
    print(f"\nExisting analysis files: {len(existing)}")

    print("\n=== ANALYSIS FILE STATUS ===")
    for sub in cohort3:
        import re
        safe_name = re.sub(r'[^a-z0-9]', '_', sub['name'].lower()).strip('_')
        safe_name = re.sub(r'_+', '_', safe_name)
        filename = f"{safe_name}_comprehensive_analysis.json"
        has = 'YES' if filename in existing else 'NO'
        print(f"  {sub['name']} -> {filename} -> Has analysis: {has}")

    # Print all submission dates for context
    print("\n=== ALL SUBMISSION DATES (sorted) ===")
    dated = []
    for sub in all_subs:
        dt = None
        for fmt in date_formats:
            try:
                dt = datetime.strptime(sub['date_str'], fmt)
                break
            except ValueError:
                continue
        if dt:
            dated.append((dt, sub['name'], sub['date_str']))
    dated.sort()
    for dt, name, ds in dated:
        marker = " <-- COHORT 3" if cohort3_start <= dt < cohort3_end else ""
        print(f"  {ds:25s} | {name}{marker}")

if __name__ == '__main__':
    main()

