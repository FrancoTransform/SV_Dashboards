import pandas as pd
import json
import os
import numpy as np
from datetime import datetime

# Configuration
INPUT_FILE = "../SemperVirens Fund I Workbook - 2025.09.30.xlsx"
OUTPUT_FILE = "src/data/fund_data.json"

def clean_value(val):
    if pd.isna(val):
        return None
    if isinstance(val, (int, float)):
        return val
    
    # Try to convert string to number
    s = str(val).strip()
    try:
        # Handle percentages or currency symbols if present
        s_clean = s.replace(',', '').replace('$', '').replace('%', '')
        if '.' in s_clean:
            return float(s_clean)
        return int(s_clean)
    except:
        return s

def clean_date(val):
    if pd.isna(val):
        return None
    try:
        # If it's already a datetime object or timestamp
        if isinstance(val, (pd.Timestamp, datetime)):
            return val.strftime('%m/%d/%Y')
        # If it's a string, try to parse it
        dt = pd.to_datetime(val)
        return dt.strftime('%m/%d/%Y')
    except:
        # Fallback for non-parseable strings
        return str(val)

def process_data():
    print("Loading Excel file...")
    try:
        xls = pd.ExcelFile(INPUT_FILE)
    except FileNotFoundError:
        print(f"Error: Could not find file at {INPUT_FILE}")
        return

    # 1. Parse Investment Characteristics (Detailed Data)
    print("Processing Investment Characteristics...")
    # Read with header=2 to get column names
    df_chars = pd.read_excel(xls, sheet_name='Investment Characteristics', header=2)
    
    # 2. Parse Investment Performance Summary (For Realized/Unrealized splits)
    print("Processing Investment Performance Summary...")
    df_perf = pd.read_excel(xls, sheet_name='Investment Performance Summary', header=3)
    
    # Create a lookup for performance data
    perf_map = {}
    for _, row in df_perf.iterrows():
        comp = clean_value(row.iloc[1]) # Company Name
        if comp:
            perf_map[str(comp).lower().strip()] = {
                "unrealized_value": clean_value(row.iloc[5]),
                "realized_value": clean_value(row.iloc[6]),
                "total_value": clean_value(row.iloc[7]),
                "gross_irr": clean_value(row.iloc[9])
            }

    investments = []
    
    # Rows to exclude
    exclude_names = [
        'average', 'median', 'dollar weighted', 'fund i - performance summary', 
        'deals:', '# of deals', 'company', 'nan', '% of deals', 'invested capital:', 
        'initial investment', '% of invested cap', 'current investment', 'current mark',
        'total value', 'moic', 'average investment:', 'initial avg. inv.', 'current avg. inv.',
        'average cost:', 'initial avg. cost', 'initial median cost', 'current valuation',
        'round', 'seed', 'a', 'b+', 'stage summary', 'deals', 'initial # of deals', 'current # of deals',
        'valuation'
    ]
    
    for _, row in df_chars.iterrows():
        company_name = clean_value(row.iloc[1])
        
        if not company_name:
            continue
            
        clean_name_lower = str(company_name).lower().strip()
        if clean_name_lower in exclude_names:
            continue
            
        # Capture all raw data
        raw_data = {}
        for col in df_chars.columns:
            # Skip Unnamed columns
            if str(col).startswith('Unnamed'):
                continue
                
            # Skip columns that are timestamps (the "dates and -1" issue)
            if isinstance(col, (pd.Timestamp, datetime)):
                continue
                
            val = clean_value(row[col])
            if val is not None:
                # Format dates in raw data too if possible
                if 'date' in str(col).lower():
                    raw_data[str(col)] = clean_date(row[col])
                else:
                    raw_data[str(col)] = val

        # Basic Info
        investment = {
            "id": clean_name_lower.replace(" ", "-"),
            "name": company_name,
            "sector": clean_value(row.iloc[4]),
            "initial_investment_date": clean_date(row.iloc[2]),
            "syndicate": clean_value(row.iloc[6]),
            "geography": "US", # Defaulting to US
            "comments": clean_value(row.iloc[38]),
            "raw_data": raw_data, # Store all raw fields
            
            # Entry Metrics
            "entry": {
                "series": clean_value(row.iloc[3]),
                "invested_amount": clean_value(row.iloc[5]),
                "ownership_percentage": clean_value(row.iloc[7]),
                "implied_valuation": 0
            },
            
            # Current Metrics
            "current": {
                "series": clean_value(row.iloc[11]),
                "ownership_percentage": clean_value(row.iloc[12]),
                "last_valuation": clean_value(row.iloc[15]),
                "holding_value": clean_value(row.iloc[16]),
                "market_value": clean_value(row.iloc[18]),
                "multiple": clean_value(row.iloc[19]),
                
                # New fields from Performance Sheet
                "realized_value": 0,
                "unrealized_value": 0,
                "gross_irr": 0
            }
        }
        
        # Merge Performance Data
        if clean_name_lower in perf_map:
            p_data = perf_map[clean_name_lower]
            investment["current"]["realized_value"] = p_data["realized_value"]
            investment["current"]["unrealized_value"] = p_data["unrealized_value"]
            investment["current"]["gross_irr"] = p_data["gross_irr"]
        
        # Calculate Entry Valuation
        try:
            if investment["entry"]["invested_amount"] and investment["entry"]["ownership_percentage"]:
                inv = float(investment["entry"]["invested_amount"])
                own = float(investment["entry"]["ownership_percentage"])
                if own > 0:
                    investment["entry"]["implied_valuation"] = inv / own
        except:
            pass
            
        investments.append(investment)

    # 3. Parse Fund Dashboard (Summary Stats)
    print("Processing Fund Dashboard...")
    df_dash = pd.read_excel(xls, sheet_name='Fund Dashboard', header=None)
    
    # Capture raw dashboard data (simple dump of non-empty cells for now)
    fund_raw_data = {}
    for i, row in df_dash.iterrows():
        key = clean_value(row.iloc[1]) # Assuming labels in col B
        val = clean_value(row.iloc[2]) # Values in col C
        if key and val:
            fund_raw_data[str(key)] = val

    fund_metrics = {
        "committed_capital": clean_value(df_dash.iloc[5, 2]),
        "capital_called": clean_value(df_dash.iloc[6, 2]),
        "percent_called": clean_value(df_dash.iloc[7, 2]),
        "invested_capital": clean_value(df_dash.iloc[10, 2]),
        "total_investments": len(investments),
        "raw_data": fund_raw_data
    }

    # 4. Extract Performance Table
    print("Extracting Performance Table...")
    perf_table = []
    # Re-read with header=3 to get the columns we identified
    df_perf_table = pd.read_excel(xls, sheet_name='Investment Performance Summary', header=3)
    
    current_status = "Unrealized" # Default
    
    for _, row in df_perf_table.iterrows():
        company = clean_value(row.iloc[1])
        
        # Detect Section Headers
        if str(company).lower().strip() == 'realized portfolio':
            current_status = "Realized"
            continue
        elif str(company).lower().strip() == 'unrealized portfolio':
            current_status = "Unrealized"
            continue
            
        if not company or str(company).lower() in ['company', 'total realized', 'total unrealized', 'total fund i', 'nan']:
            continue
            
        # Check if it's a valid row (has investment data)
        invested = clean_value(row.iloc[4])
        if invested is None:
            continue

        entry = {
            "company": company,
            "status": current_status,
            "initial_date": clean_date(row.iloc[2]),
            "exit_date": clean_date(row.iloc[3]),
            "invested": clean_value(row.iloc[4]),
            "unrealized": clean_value(row.iloc[5]),
            "realized": clean_value(row.iloc[6]),
            "total_value": clean_value(row.iloc[7]),
            "gross_multiple": clean_value(row.iloc[8]),
            "gross_irr": clean_value(row.iloc[9])
        }
        perf_table.append(entry)

    # Output Data
    data = {
        "fund_metrics": fund_metrics,
        "investments": investments,
        "performance_table": perf_table,
        "last_updated": datetime.now().strftime('%m/%d/%Y')
    }
    
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(data, f, indent=2, default=str)
    
    print(f"Successfully generated {OUTPUT_FILE} with {len(investments)} investments.")

if __name__ == "__main__":
    process_data()
