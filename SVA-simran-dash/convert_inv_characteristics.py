import pandas as pd
import json
import numpy as np

file_path = "/Users/franco/Documents/SemperVirens/SVA-simran-dash/SemperVirens Capital Fund LP - 9.30.2025 - Inv Characteristics.xlsx"

# Read the Excel file - column names are in row 5 (0-indexed row 4)
df = pd.read_excel(file_path, sheet_name='Investment Characteristics', header=4)

print(f"Columns from row 5: {list(df.columns)}")
print(f"Shape: {df.shape}")
print(f"\nFirst few rows:")
print(df.head(3))

# Remove rows that are empty or totals
df = df[df.iloc[:, 0].notna()]  # First column should have company name
df = df[~df.iloc[:, 0].astype(str).str.contains('Total|Partially|Merged/acquired|\\*', case=False, na=False, regex=True)]

print(f"\nFiltered to {len(df)} companies")

# Replace NaN with None for JSON serialization
df = df.replace({np.nan: None})

# Convert to list of dictionaries
investments = df.to_dict('records')

# Save to JSON file
output_path = "/Users/franco/Documents/SemperVirens/SVA-simran-dash/dashboard/src/data/investment_characteristics.json"
with open(output_path, 'w') as f:
    json.dump(investments, f, indent=2, default=str)

print(f"\nSuccessfully converted {len(investments)} investments to JSON")
print(f"Output saved to: {output_path}")
print(f"\nFinal columns: {list(df.columns)}")
