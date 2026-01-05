import pandas as pd
import os
import sys

# Redirect stdout to a file
sys.stdout = open('analysis_output.txt', 'w')

file_path = "/Users/franco/Documents/SemperVirens/SVA-simran-dash/SemperVirens Fund I Workbook - 2025.09.30.xlsx"

try:
    xls = pd.ExcelFile(file_path)
    
    print(f"File: {os.path.basename(file_path)}")
    print(f"Sheet Names: {xls.sheet_names}")
    print("-" * 30)
    
    for sheet_name in xls.sheet_names:
        print(f"\nAnalyzing Sheet: '{sheet_name}'")
        try:
            df = pd.read_excel(xls, sheet_name=sheet_name)
            print(f"Dimensions: {df.shape}")
            print(f"Columns: {list(df.columns)}")
            # Print first 10 rows to get a better sense
            print(df.head(10).to_string())
            print("-" * 30)
        except Exception as e:
            print(f"Error reading sheet '{sheet_name}': {e}")

except Exception as e:
    print(f"Failed to load Excel file: {e}")
