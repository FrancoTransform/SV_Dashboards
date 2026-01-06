import pandas as pd

INPUT_FILE = "../SemperVirens Fund I Workbook - 2025.09.30.xlsx"

def analyze_headers():
    print("Loading Excel file...")
    xls = pd.ExcelFile(INPUT_FILE)
    
    print("\n--- Investment Characteristics Headers (Row 3 / Index 2) ---")
    df = pd.read_excel(xls, sheet_name='Investment Characteristics', header=2)
    for i, col in enumerate(df.columns):
        print(f"Col {i}: {col} (Type: {type(col)})")

    print("\n--- First Row of Data ---")
    print(df.iloc[0].to_dict())

if __name__ == "__main__":
    analyze_headers()
