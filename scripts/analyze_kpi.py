import xlrd
import msoffcrypto
import io
import os

file_path = 'KPI-02.26.xls'
password = 'q'

print(f"--- Analyzing {file_path} ---")
if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

try:
    decrypted_workbook = io.BytesIO()
    with open(file_path, "rb") as file:
        office_file = msoffcrypto.OfficeFile(file)
        office_file.load_key(password=password)
        office_file.decrypt(decrypted_workbook)

    wb = xlrd.open_workbook(file_contents=decrypted_workbook.getvalue())
    print(f"Sheet names: {wb.sheet_names()}")

    for sheet_name in wb.sheet_names():
        print(f"\nSheet: {sheet_name}")
        sheet = wb.sheet_by_name(sheet_name)
        print(f"Rows: {sheet.nrows}, Columns: {sheet.ncols}")
        print("First 5 rows:")
        for i in range(min(5, sheet.nrows)):
            print(f"  {sheet.row_values(i)}")
except Exception as e:
    print(f"Error: {e}")
