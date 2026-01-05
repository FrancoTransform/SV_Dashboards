import pandas as pd
import json
import numpy as np
from datetime import datetime

def extract_fund_data(workbook_path, fund_name, fund_id):
    """Extract fund data from workbook"""
    print(f"\n{'='*80}")
    print(f"Processing {fund_name}")
    print(f"{'='*80}")
    
    xls = pd.ExcelFile(workbook_path)
    
    # Read Investment Performance Summary sheet
    df = pd.read_excel(xls, sheet_name='Investment Performance Summary')
    
    # Find the header row (usually has "Company" in first column)
    header_row = None
    for i in range(min(10, len(df))):
        if 'Company' in str(df.iloc[i, 1]):
            header_row = i
            break
    
    if header_row is None:
        print(f"Could not find header row for {fund_name}")
        return None
    
    # Re-read with correct header
    df = pd.read_excel(xls, sheet_name='Investment Performance Summary', header=header_row)
    
    print(f"Found header at row {header_row}")
    print(f"Columns: {list(df.columns[:10])}")
    print(f"Shape: {df.shape}")
    
    # Clean up - remove empty rows and summary rows
    df = df[df.iloc[:, 1].notna()]  # Second column should have company names
    df = df[~df.iloc[:, 1].astype(str).str.contains('Total|Average|Median|Partially|Merged', case=False, na=False, regex=True)]
    
    print(f"After filtering: {len(df)} companies")
    
    # Replace NaN with None
    df = df.replace({np.nan: None})
    
    # Convert to records
    investments = df.to_dict('records')
    
    # Create fund data structure
    fund_data = {
        "fund_id": fund_id,
        "fund_name": fund_name,
        "investments": investments,
        "extracted_at": datetime.now().isoformat()
    }
    
    return fund_data

# Process all three funds
funds = [
    {
        "path": "/Users/franco/Documents/SemperVirens/SVA-simran-dash/SemperVirens Fund I Workbook - 2025.09.30.xlsx",
        "name": "SemperVirens Fund I",
        "id": "fund-i"
    },
    {
        "path": "/Users/franco/Documents/SemperVirens/SVA-simran-dash/SemperVirens Fund II Workbook - 2025.12.31.xlsx",
        "name": "SemperVirens Fund II",
        "id": "fund-ii"
    },
    {
        "path": "/Users/franco/Documents/SemperVirens/SVA-simran-dash/SemperVirens Fund III Workbook - 2025.12.31.xlsx",
        "name": "SemperVirens Fund III",
        "id": "fund-iii"
    }
]

all_funds_data = {}

for fund in funds:
    try:
        fund_data = extract_fund_data(fund["path"], fund["name"], fund["id"])
        if fund_data:
            all_funds_data[fund["id"]] = fund_data
            
            # Save individual fund file
            output_path = f"/Users/franco/Documents/SemperVirens/SVA-simran-dash/dashboard/src/data/{fund['id']}_performance.json"
            with open(output_path, 'w') as f:
                json.dump(fund_data, f, indent=2, default=str)
            print(f"✓ Saved to {output_path}")
    except Exception as e:
        print(f"✗ Error processing {fund['name']}: {e}")
        import traceback
        traceback.print_exc()

# Save combined funds index
index_path = "/Users/franco/Documents/SemperVirens/SVA-simran-dash/dashboard/src/data/funds_index.json"
funds_index = {
    "funds": [
        {"id": "fund-i", "name": "SemperVirens Fund I", "date": "2025-09-30"},
        {"id": "fund-ii", "name": "SemperVirens Fund II", "date": "2025-12-31"},
        {"id": "fund-iii", "name": "SemperVirens Fund III", "date": "2025-12-31"}
    ]
}

with open(index_path, 'w') as f:
    json.dump(funds_index, f, indent=2)

print(f"\n{'='*80}")
print(f"✓ All funds processed successfully!")
print(f"✓ Funds index saved to {index_path}")
print(f"{'='*80}")
