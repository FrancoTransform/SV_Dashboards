import pandas as pd
import json
import sys

# Redirect stdout to a file
sys.stdout = open('fund_ii_iii_analysis.txt', 'w')

files = [
    "/Users/franco/Documents/SemperVirens/SVA-simran-dash/SemperVirens Fund II Workbook - 2025.12.31.xlsx",
    "/Users/franco/Documents/SemperVirens/SVA-simran-dash/SemperVirens Fund III Workbook - 2025.12.31.xlsx"
]

for file_path in files:
    try:
        xls = pd.ExcelFile(file_path)
        
        print(f"\n{'='*80}")
        print(f"File: {file_path.split('/')[-1]}")
        print(f"{'='*80}")
        print(f"Sheet Names: {xls.sheet_names}")
        print("-" * 80)
        
        for sheet_name in xls.sheet_names:
            print(f"\n--- Sheet: '{sheet_name}' ---")
            try:
                df = pd.read_excel(xls, sheet_name=sheet_name)
                print(f"Dimensions: {df.shape}")
                print(f"First 5 rows:")
                print(df.head(5).to_string())
            except Exception as e:
                print(f"Error reading sheet '{sheet_name}': {e}")
            print()

    except Exception as e:
        print(f"Failed to load Excel file {file_path}: {e}")

sys.stdout.close()
print("Analysis complete! Check fund_ii_iii_analysis.txt")
