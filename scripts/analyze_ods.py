
import pandas as pd
import sys

def analyze():
    file_path = '02.26.ods'
    try:
        xl = pd.ExcelFile(file_path, engine='odf')
        print(f"Sheets: {xl.sheet_names}")
        
        for sheet_name in ['Оформление', 'KPI']:
            if sheet_name in xl.sheet_names:
                df = pd.read_excel(file_path, sheet_name=sheet_name, engine='odf')
                print(f"\n--- {sheet_name} ---")
                print(f"Columns: {df.columns.tolist()}")
                print(f"Shape: {df.shape}")
                print("\nSample Rows:")
                print(df.head(20).to_string())
            else:
                print(f"\nSheet '{sheet_name}' not found.")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    analyze()
