import pandas as pd
import json
import sys

# Redirect stdout to a file
sys.stdout = open('inv_characteristics_analysis.txt', 'w')

file_path = "/Users/franco/Documents/SemperVirens/SVA-simran-dash/SemperVirens Capital Fund LP - 9.30.2025 - Inv Characteristics.xlsx"

try:
    xls = pd.ExcelFile(file_path)
    
    print(f"File: SemperVirens Capital Fund LP - 9.30.2025 - Inv Characteristics.xlsx")
    print(f"Sheet Names: {xls.sheet_names}")
    print("-" * 80)
    
    for sheet_name in xls.sheet_names:
        print(f"\n{'='*80}")
        print(f"Analyzing Sheet: '{sheet_name}'")
        print('='*80)
        try:
            df = pd.read_excel(xls, sheet_name=sheet_name)
            print(f"Dimensions: {df.shape}")
            print(f"\nColumns ({len(df.columns)}):")
            for i, col in enumerate(df.columns):
                print(f"  {i+1}. {col}")
            
            # Print first 15 rows
            print(f"\nFirst 15 rows:")
            print(df.head(15).to_string())
            print("\n" + "-" * 80)
            
            # Print last 5 rows to see totals
            print(f"\nLast 5 rows:")
            print(df.tail(5).to_string())
            print("\n" + "=" * 80)
        except Exception as e:
            print(f"Error reading sheet '{sheet_name}': {e}")

except Exception as e:
    print(f"Failed to load Excel file: {e}")

sys.stdout.close()
print("Analysis complete! Check inv_characteristics_analysis.txt")
