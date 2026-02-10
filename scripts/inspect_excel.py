
import pandas as pd
import os

files = ['KPI-02.26.xls', 'ФЕВРАЛЬ2026.xlsx']

def inspect_file(file_path):
    print(f"--- Analyzing {file_path} ---")
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    try:
        xls = pd.ExcelFile(file_path)
        print(f"Sheet names: {xls.sheet_names}")

        for sheet_name in xls.sheet_names:
            print(f"\nSheet: {sheet_name}")
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            print(f"Shape: {df.shape}")
            print("Columns:", df.columns.tolist())
            print("First 5 rows:")
            print(df.head().to_string())
            print("-" * 20)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")

for file in files:
    inspect_file(os.path.join(os.getcwd(), file))
