#!/usr/bin/env python3
"""
Check how companies are being divided into cohorts based on submission dates.
"""

import json
from pathlib import Path
from datetime import datetime

def parse_date(date_str):
    """Parse date string to datetime object"""
    try:
        return datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
    except:
        return None

def main():
    analysis_dir = Path("analysis")
    
    # Date mapping from the template (this should match what's in index.html)
    date_mapping = {
        'Affinity Test': {'date': '2025-04-01 12:00:00', 'display': 'April 1, 2025 12:00'},
        'Agave Health': {'date': '2025-04-15 14:30:22', 'display': 'April 15, 2025 14:30'},
        'Aidora': {'date': '2025-05-15 00:08:11', 'display': 'May 15, 2025 00:08'},
        'Audria': {'date': '2025-04-10 09:15:33', 'display': 'April 10, 2025 09:15'},
        'Axima AI': {'date': '2025-04-20 16:45:12', 'display': 'April 20, 2025 16:45'},
        'Beacon': {'date': '2025-05-16 17:14:43', 'display': 'May 16, 2025 17:14'},
        'BetterYou': {'date': '2025-04-05 11:22:45', 'display': 'April 5, 2025 11:22'},
        'Blank Slate Technologies': {'date': '2025-05-23 14:08:10', 'display': 'May 23, 2025 14:08'},
        'Bloom': {'date': '2025-04-12 13:55:28', 'display': 'April 12, 2025 13:55'},
        'Bogaisa Pty Ltd': {'date': '2025-04-08 10:30:15', 'display': 'April 8, 2025 10:30'},
        'Borderless AI': {'date': '2025-05-01 01:37:06', 'display': 'May 1, 2025 01:37'},
        'Branca.ai': {'date': '2025-04-18 15:20:40', 'display': 'April 18, 2025 15:20'},
        'Cherrygiving': {'date': '2025-04-22 12:10:55', 'display': 'April 22, 2025 12:10'},
        'Clasp': {'date': '2025-04-14 08:45:30', 'display': 'April 14, 2025 08:45'},
        'Counter Fin': {'date': '2025-04-16 17:25:18', 'display': 'April 16, 2025 17:25'},
        'CryptoMate': {'date': '2025-04-11 14:35:22', 'display': 'April 11, 2025 14:35'},
        'DIYNation.ai': {'date': '2025-04-19 09:50:45', 'display': 'April 19, 2025 09:50'},
        'Deep Care': {'date': '2025-04-13 16:15:33', 'display': 'April 13, 2025 16:15'},
        'Defiant Health': {'date': '2025-04-25 22:46:38', 'display': 'April 25, 2025 22:46'},
        'DoktorConnect': {'date': '2025-04-07 13:20:12', 'display': 'April 7, 2025 13:20'},
        'Ezra': {'date': '2025-05-10 19:22:46', 'display': 'May 10, 2025 19:22'},
        'Factos Capital': {'date': '2025-04-21 11:40:28', 'display': 'April 21, 2025 11:40'},
        'Fift Health': {'date': '2025-04-17 14:55:50', 'display': 'April 17, 2025 14:55'},
        'Firepit Health': {'date': '2025-04-24 10:25:15', 'display': 'April 24, 2025 10:25'},
        'GTMFlow': {'date': '2025-04-26 15:30:42', 'display': 'April 26, 2025 15:30'},
        'GigEasy': {'date': '2025-04-09 12:45:20', 'display': 'April 9, 2025 12:45'},
        'GigHQ.ai': {'date': '2025-04-23 09:15:35', 'display': 'April 23, 2025 09:15'},
        'Graphio.ai': {'date': '2025-04-06 16:30:48', 'display': 'April 6, 2025 16:30'},
        'Guaranteed Health, Inc.': {'date': '2025-05-09 20:58:36', 'display': 'May 9, 2025 20:58'},
        'Herd Health': {'date': '2025-04-28 13:42:25', 'display': 'April 28, 2025 13:42'},
        'Hero': {'date': '2025-04-27 11:18:50', 'display': 'April 27, 2025 11:18'},
        'JOGO Health': {'date': '2025-04-29 16:42:53', 'display': 'April 29, 2025 16:42'},
        'JOYA Health': {'date': '2025-05-08 17:42:40', 'display': 'May 8, 2025 17:42'},
        'KELLS': {'date': '2025-04-04 15:25:38', 'display': 'April 4, 2025 15:25'},
        'Kaatch': {'date': '2025-04-03 14:10:22', 'display': 'April 3, 2025 14:10'},
        'Kept Inc': {'date': '2025-05-12 16:45:28', 'display': 'May 12, 2025 16:45'},
        'Kottackal Technologies QFZ LLC': {'date': '2025-04-02 10:55:15', 'display': 'April 2, 2025 10:55'},
        'LOGISTIFY AI': {'date': '2025-06-02 20:14:01', 'display': 'June 2, 2025 20:14'},
        'Lockwell Inc': {'date': '2025-05-14 00:34:15', 'display': 'May 14, 2025 00:34'},
        'Magier AI': {'date': '2025-05-11 14:20:33', 'display': 'May 11, 2025 14:20'},
        'Mandala for Us Inc.': {'date': '2025-04-29 22:47:47', 'display': 'April 29, 2025 22:47'},
        'Multiply': {'date': '2025-04-30 21:27:43', 'display': 'April 30, 2025 21:27'},
        'My Benefit Options': {'date': '2025-05-07 12:35:20', 'display': 'May 7, 2025 12:35'},
        'NuCo Credentialing': {'date': '2025-05-13 18:22:45', 'display': 'May 13, 2025 18:22'},
        'Outro Health': {'date': '2025-05-08 14:10:42', 'display': 'May 8, 2025 14:10'},
        'Paramean Solutions': {'date': '2025-05-09 18:49:29', 'display': 'May 9, 2025 18:49'},
        'ProjectSet': {'date': '2025-05-05 10:15:18', 'display': 'May 5, 2025 10:15'},
        'RainyDayPal': {'date': '2025-05-04 16:28:35', 'display': 'May 4, 2025 16:28'},
        'RituWell': {'date': '2025-05-06 22:35:56', 'display': 'May 6, 2025 22:35'},
        'SUND LLC': {'date': '2025-05-03 14:45:22', 'display': 'May 3, 2025 14:45'},
        'SmartHeritance': {'date': '2025-06-02 20:34:51', 'display': 'June 2, 2025 20:34'},
        'Sunny Health AI': {'date': '2025-05-06 02:20:44', 'display': 'May 6, 2025 02:20'},
        'Teamcast.ai': {'date': '2025-05-17 11:30:25', 'display': 'May 17, 2025 11:30'},
        'TenYour': {'date': '2025-05-18 09:45:12', 'display': 'May 18, 2025 09:45'},
        'The PEO App, Inc.': {'date': '2025-05-19 15:20:38', 'display': 'May 19, 2025 15:20'},
        'Therify': {'date': '2025-05-20 13:55:45', 'display': 'May 20, 2025 13:55'},
        'Toothsome': {'date': '2025-05-02 04:19:13', 'display': 'May 2, 2025 04:19'},
        'Value Buddy': {'date': '2025-05-21 16:40:28', 'display': 'May 21, 2025 16:40'},
        'Virtual Sapiens': {'date': '2025-05-01 15:48:53', 'display': 'May 1, 2025 15:48'},
        'Volta Health': {'date': '2025-05-09 20:28:20', 'display': 'May 9, 2025 20:28'},
        'Wave': {'date': '2025-05-30 22:28:27', 'display': 'May 30, 2025 22:28'},
        'WayPave LLC': {'date': '2025-05-22 12:15:50', 'display': 'May 22, 2025 12:15'},
        'Whynda': {'date': '2025-05-24 14:30:15', 'display': 'May 24, 2025 14:30'},
        'Wiggl Health': {'date': '2025-05-25 10:45:22', 'display': 'May 25, 2025 10:45'},
        'Workrz': {'date': '2025-05-26 16:20:35', 'display': 'May 26, 2025 16:20'},
        'chainstaff': {'date': '2025-05-27 13:10:48', 'display': 'May 27, 2025 13:10'},
        'iCommute': {'date': '2025-05-28 11:55:25', 'display': 'May 28, 2025 11:55'}
    }
    
    cohort_cutoff = datetime.strptime('2025-05-16 00:00:00', '%Y-%m-%d %H:%M:%S')
    
    cohort1_companies = []
    cohort2_companies = []
    no_date_companies = []
    
    # Load all comprehensive analysis files
    for file_path in analysis_dir.glob('*_comprehensive_analysis.json'):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                company_name = data.get('company_name', '').strip()
                
                if company_name in date_mapping:
                    submission_date = parse_date(date_mapping[company_name]['date'])
                    if submission_date:
                        if submission_date < cohort_cutoff:
                            cohort1_companies.append(company_name)
                        else:
                            cohort2_companies.append(company_name)
                    else:
                        no_date_companies.append(company_name)
                else:
                    no_date_companies.append(company_name)
                    
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    print("=== COHORT DIVISION ANALYSIS ===\n")
    print(f"Cohort cutoff: May 16, 2025 00:00:00")
    print(f"Total companies in analysis files: {len(cohort1_companies) + len(cohort2_companies) + len(no_date_companies)}")
    print(f"Cohort 1 (before May 16): {len(cohort1_companies)}")
    print(f"Cohort 2 (May 16 onwards): {len(cohort2_companies)}")
    print(f"No date mapping: {len(no_date_companies)}")
    
    if no_date_companies:
        print(f"\n=== COMPANIES WITHOUT DATE MAPPING ===")
        for company in sorted(no_date_companies):
            print(f"- {company}")
    
    print(f"\n=== COHORT 1 COMPANIES ({len(cohort1_companies)}) ===")
    for company in sorted(cohort1_companies):
        date_info = date_mapping.get(company, {})
        print(f"- {company} ({date_info.get('display', 'No date')})")
    
    print(f"\n=== COHORT 2 COMPANIES ({len(cohort2_companies)}) ===")
    for company in sorted(cohort2_companies):
        date_info = date_mapping.get(company, {})
        print(f"- {company} ({date_info.get('display', 'No date')})")

if __name__ == "__main__":
    main()
