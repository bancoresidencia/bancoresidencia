import os
import openpyxl

files = [
  ('gabarito_(2).xlsx', 'C:/Users/cnath/.gemini/antigravity/brain/9618f204-3788-45d2-8b60-26cb27d0dbd1/.user_uploaded/media_1794604731419_39334b2d.xlsx'),
  ('gabarito_(1).xlsx', 'C:/Users/cnath/.gemini/antigravity/brain/9618f204-3788-45d2-8b60-26cb27d0dbd1/.user_uploaded/media_1794604731457_571dbc0d.xlsx')
]

for name, path in files:
    if not os.path.exists(path):
        print(f"File {name} not found at {path}")
        continue
    wb = openpyxl.load_workbook(path, data_only=True)
    print(f"\n=== {name} ===")
    print(f"Sheets: {wb.sheetnames}")
    sheet = wb.active
    rows = list(sheet.iter_rows(values_only=True))
    print(f"Total rows: {len(rows)}")
    for r in rows[:3]:
        print("  ", r[:6])
