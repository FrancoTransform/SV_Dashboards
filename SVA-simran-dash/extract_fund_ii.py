import pandas as pd
import json
import numpy as np
from datetime import datetime

def parse_date(date_val):
    """Parse date value to string format"""
    if pd.isna(date_val):
        return None
    if isinstance(date_val, str):
        return date_val
    try:
        return pd.to_datetime(date_val).strftime('%Y-%m-%d')
    except:
        return str(date_val)

def safe_float(val):
    """Safely convert to float"""
    if pd.isna(val) or val is None:
        return 0
    try:
        return float(val)
    except:
        return 0

def extract_fund_ii_data():
    """Extract Fund II data in the same format as Fund I"""
    
    workbook_path = "/Users/franco/Documents/SemperVirens/SVA-simran-dash/SemperVirens Fund II Workbook - 2025.12.31.xlsx"
    
    print("="*80)
    print("Extracting Fund II Data")
    print("="*80)
    
    xls = pd.ExcelFile(workbook_path)
    
    # Read Investment Characteristics sheet for sector data (header at row 2)
    char_df = pd.read_excel(xls, sheet_name='Investment Characteristics', header=2)
    char_df = char_df[char_df['Company'].notna()]
    
    # Create lookups for all characteristics
    sector_lookup = {}
    series_lookup = {}
    syndicate_lookup = {}
    rationale_lookup = {}
    fd_lookup = {}
    last_val_lookup = {}
    
    for _, row in char_df.iterrows():
        company = str(row['Company']).strip()
        
        sector_lookup[company] = str(row['Sector']).strip() if pd.notna(row['Sector']) else "Unknown"
        series_lookup[company] = str(row['Series']).strip() if pd.notna(row['Series']) else "Unknown"
        syndicate_lookup[company] = str(row['VC Syndicate']).strip() if 'VC Syndicate' in row and pd.notna(row['VC Syndicate']) else ""
        rationale_lookup[company] = str(row['Rationale']).strip() if 'Rationale' in row and pd.notna(row['Rationale']) else ""
        fd_lookup[company] = safe_float(row['FD%']) if 'FD%' in row else 0
        last_val_lookup[company] = safe_float(row['Last Valuation']) if 'Last Valuation' in row else 0
    
    print(f"Loaded sector and series data for {len(sector_lookup)} companies")
    
    # Read Investment Performance Summary sheet (header at row 3)
    perf_df = pd.read_excel(xls, sheet_name='Investment Performance Summary', header=3)
    
    print(f"\nPerformance Summary columns: {list(perf_df.columns[:15])}")
    print(f"Shape: {perf_df.shape}")
    
    # Clean up - remove summary rows
    perf_df = perf_df[perf_df.iloc[:, 1].notna()]
    perf_df = perf_df[~perf_df.iloc[:, 1].astype(str).str.contains('Total|Average|Median', case=False, na=False, regex=True)]
    
    print(f"After filtering: {len(perf_df)} companies")
    
    # Build investments list
    investments = []
    performance_table = []
    
    # Track used IDs to ensure uniqueness
    used_ids = set()
    
    for idx, row in perf_df.iterrows():
        company_name = str(row.iloc[1]).strip() if pd.notna(row.iloc[1]) else f"Company_{idx}"
        
        # Create unique ID
        base_id = company_name.lower().replace(" ", "-").replace(".", "").replace(",", "").replace("(", "").replace(")", "")
        company_id = base_id
        counter = 1
        while company_id in used_ids:
            company_id = f"{base_id}-{counter}"
            counter += 1
        used_ids.add(company_id)
        
        # Extract data from columns
        initial_date = parse_date(row.iloc[2]) if len(row) > 2 else None
        
        # Get data from lookups
        sector = sector_lookup.get(company_name, "Unknown")
        series = series_lookup.get(company_name, "Unknown")
        syndicate = syndicate_lookup.get(company_name, "")
        rationale = rationale_lookup.get(company_name, "")
        fd_percent = fd_lookup.get(company_name, 0)
        last_val = last_val_lookup.get(company_name, 0)
        
        # Financial data
        invested = safe_float(row.iloc[4]) if len(row) > 4 else 0
        unrealized = safe_float(row.iloc[5]) if len(row) > 5 else 0
        realized = safe_float(row.iloc[6]) if len(row) > 6 else 0
        total_value = safe_float(row.iloc[7]) if len(row) > 7 else 0
        gross_multiple = safe_float(row.iloc[8]) if len(row) > 8 else 0
        gross_irr = safe_float(row.iloc[9]) if len(row) > 9 else 0
        
        # Create investment entry
        investment = {
            "id": company_id,
            "name": company_name,
            "sector": sector,
            "syndicate": syndicate,
            "comments": rationale,
            "geography": "", # Not available
            "initial_investment_date": initial_date,
            "entry": {
                "date": initial_date,
                "series": series,
                "invested_amount": invested,
                "ownership_percentage": fd_percent,
                "implied_valuation": invested / fd_percent if fd_percent > 0 else 0
            },
            "current": {
                "market_value": unrealized,
                "unrealized_gain": unrealized - invested if unrealized > 0 else 0,
                "multiple": gross_multiple,
                "gross_irr": gross_irr,
                "realized_value": realized,
                "unrealized_value": unrealized,
                "holding_value": unrealized,
                "last_valuation": last_val,
                "series": series, # Assuming current is same as entry for now if not tracked separately
                "ownership_percentage": fd_percent # Assuming constant
            }
        }
        
        investments.append(investment)
        
        # Create performance table entry
        status = "Realized" if realized > 0 and unrealized == 0 else "Unrealized"
        perf_entry = {
            "company": company_name,
            "initial_date": initial_date,
            "exit_date": None,
            "invested": invested,
            "unrealized": unrealized,
            "realized": realized,
            "total_value": total_value,
            "gross_multiple": gross_multiple,
            "gross_irr": gross_irr,
            "status": status
        }
        
        performance_table.append(perf_entry)
    
    
    # ---------------------------------------------------------
    # Generate Investment Characteristics Data (for Portfolio Table)
    # ---------------------------------------------------------
    print("\nGenerating characteristics data...")
    characteristics_data = []
    
    # Map Fund II columns to PortfolioTable expected format
    # expected keys: "Unnamed: 0", "Company", "Description", "Website", "HQ", "Sector", "Initial Inv. Date", 
    # "Series", "$ Invested", "VC Syndicate", "Series.1", "FD%", "$ Current Invested Cost", "Total Invested Cost", 
    # "Carrying Value", "Realized Proceeds", "Total Value", "Gross MOIC", "Last Post Money Value", 
    # "Current SV Company Value", "Red/Yellow/Green Status", "SV Outlook"
    
    for _, row in char_df.iterrows():
        company = str(row['Company']).strip() if pd.notna(row['Company']) else "Unknown"
        
        # Skip summary rows or invalid company names
        # Expanded list of summary labels to exclude
        exclude_terms = [
            '% of Invested Cap', 'Total', 'nan', 'Unknown', 'Current Avg. Inv.', 'Avg.', 
            'Average Investment:', 'Median', '# of Deals', '# of', '% of Deals', '% of', 
            'Initial Investment', 'Investment Characteristics', 'Current Investment', 'MOIC',
            'Seed', 'A', 'B+'
        ]
        if any(x in company for x in exclude_terms):
            continue
            
        # Additional check: Real investments should normally have a Date or Series
        has_date = 'Date' in row and pd.notna(row['Date'])
        # Check for excel epoch (0 -> 1970-01-01) which is invalid for this fund
        if has_date:
            date_str = str(row['Date'])
            if '1970' in date_str or '1900' in date_str:
                has_date = False
                
        has_series = 'Series' in row and pd.notna(row['Series'])
        
        if not has_date and not has_series:
            # likely a summary row that slipped through name check
            continue
        
        # Determine Rationale/Outlook
        rationale = str(row['Rationale']) if 'Rationale' in row and pd.notna(row['Rationale']) else ""
        
        # Financials from characteristics sheet
        invested = safe_float(row['$ Invested']) if '$ Invested' in row else 0
        market_val = safe_float(row['Market Value']) if 'Market Value' in row else 0
        multiple = safe_float(row['Multiple']) if 'Multiple' in row else 0
        
        # Approximate other values if not directly available
        total_value = market_val  # Assuming mostly unrealized for now if Realized not distinct in this sheet
        
        char_entry = {
            "Unnamed: 0": company,
            "Company": company,
            "Description": rationale, # Mapping Rationale to Description
            "Website": "", # Not available
            "HQ": "", # Not available
            "Sector": str(row['Sector']) if 'Sector' in row and pd.notna(row['Sector']) else "Unknown",
            "Initial Inv. Date": parse_date(row['Date']) if 'Date' in row else None,
            "Series": str(row['Series']) if 'Series' in row and pd.notna(row['Series']) else "",
            "$ Invested": invested,
            "VC Syndicate": str(row['VC Syndicate']) if 'VC Syndicate' in row and pd.notna(row['VC Syndicate']) else "",
            "Series.1": str(row['Series.1']) if 'Series.1' in row and pd.notna(row['Series.1']) else "",
            "FD%": safe_float(row['FD%']) if 'FD%' in row else 0,
            "$ Current Invested Cost": invested, # Using Invested as proxy
            "Total Invested Cost": invested,
            "Carrying Value": market_val,
            "Realized Proceeds": 0, # Not easily available in this sheet
            "Total Value": total_value,
            "Gross MOIC": multiple,
            "Last Post Money Value": safe_float(row['Last Valuation']) if 'Last Valuation' in row else 0,
            "Current SV Company Value": market_val,
            "Red/Yellow/Green Status": "",
            "SV Outlook": str(row['Lead']) if 'Lead' in row and pd.notna(row['Lead']) else "" # Putting Lead in Outlook or Notes?
        }
        characteristics_data.append(char_entry)
        
    char_output_path = "/Users/franco/Documents/SemperVirens/SVA-simran-dash/dashboard/src/data/fund_ii_characteristics.json"
    with open(char_output_path, 'w') as f:
        json.dump(characteristics_data, f, indent=2, default=str)
    print(f"✓ Fund II characteristics saved to {char_output_path}")

    # Calculate fund metrics
    total_invested = sum(inv["entry"]["invested_amount"] for inv in investments)
    total_unrealized = sum(inv["current"]["market_value"] for inv in investments)
    total_realized = sum(pe["realized"] for pe in performance_table)
    total_value = total_unrealized + total_realized
    
    fund_metrics = {
        "committed_capital": total_invested * 1.2,  # Estimate
        "invested_capital": total_invested,
        "total_value": total_value,
        "unrealized_value": total_unrealized,
        "realized_value": total_realized,
        "gross_irr": sum(pe["gross_irr"] for pe in performance_table if pe["gross_irr"] > 0) / len([pe for pe in performance_table if pe["gross_irr"] > 0]) if any(pe["gross_irr"] > 0 for pe in performance_table) else 0,
        "gross_moic": total_value / total_invested if total_invested > 0 else 0,
        "raw_data": {
            "MOIC": total_value / total_invested if total_invested > 0 else 0,
            "Gross IRR": sum(pe["gross_irr"] for pe in performance_table if pe["gross_irr"] > 0) / len([pe for pe in performance_table if pe["gross_irr"] > 0]) if any(pe["gross_irr"] > 0 for pe in performance_table) else 0,
            "Avg Entry Ownership": 0.0092  # Placeholder
        }
    }
    
    # Create fund data structure
    fund_data = {
        "fund_name": "SemperVirens Fund II",
        "last_updated": "2025-12-31",
        "fund_metrics": fund_metrics,
        "investments": investments,
        "performance_table": performance_table
    }
    
    # Save to JSON
    output_path = "/Users/franco/Documents/SemperVirens/SVA-simran-dash/dashboard/src/data/fund_ii_data.json"
    with open(output_path, 'w') as f:
        json.dump(fund_data, f, indent=2, default=str)
    
    print(f"\n✓ Fund II data saved to {output_path}")
    print(f"  - {len(investments)} investments")
    print(f"  - Total Invested: ${total_invested:,.2f}")
    print(f"  - Total Value: ${total_value:,.2f}")
    print(f"  - Gross MOIC: {fund_metrics['gross_moic']:.2f}x")
    
    # Print sector breakdown
    sector_counts = {}
    for inv in investments:
        sector = inv['sector']
        sector_counts[sector] = sector_counts.get(sector, 0) + 1
    print(f"\nSector breakdown:")
    for sector, count in sorted(sector_counts.items()):
        print(f"  - {sector}: {count}")
    
    return fund_data

if __name__ == "__main__":
    try:
        fund_data = extract_fund_ii_data()
        print("\n" + "="*80)
        print("✓ Fund II extraction complete!")
        print("="*80)
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
