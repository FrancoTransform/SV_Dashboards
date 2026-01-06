import pandas as pd

INPUT_FILE = "../SemperVirens Fund I Workbook - 2025.09.30.xlsx"

def analyze_perf_summary():
    print("Loading Excel file...")
    xls = pd.ExcelFile(INPUT_FILE)
    
    print("\n--- Investment Performance Summary Headers (Row 4 / Index 3) ---")
    # The previous script used header=3, let's verify
    df = pd.read_excel(xls, sheet_name='Investment Performance Summary', header=3)
    for i, col in enumerate(df.columns):
        print(f"Col {i}: {col} (Type: {type(col)})")

    print("\n--- First 5 Rows of Data ---")
    print(df.head(5).to_string())

if __name__ == "__main__":
    analyze_perf_summary()
