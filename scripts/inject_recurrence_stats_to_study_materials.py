#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def main():
    base_dir = r'C:\bancoresidencia\bancoresidencia'
    analytics_path = os.path.join(base_dir, 'data', 'analytics', 'infeccao-puerperal.json')
    ts_path = os.path.join(base_dir, 'src', 'data', 'studyMaterialsData.ts')

    with open(analytics_path, 'r', encoding='utf-8') as f:
        analytics_data = json.load(f)

    with open(ts_path, 'r', encoding='utf-8') as f:
        ts_code = f.read()

    target_str = '"id": "mat-inf-puerp-01",'
    if target_str not in ts_code:
        print("mat-inf-puerp-01 not found!")
        return

    # Check if recurrenceStats already added
    if '"recurrenceStats":' in ts_code[ts_code.find(target_str):ts_code.find(target_str) + 1000]:
        print("recurrenceStats already present for mat-inf-puerp-01!")
        return

    # Add recurrenceStats right after "id": "mat-inf-puerp-01",
    formatted_stats = json.dumps(analytics_data, indent=4, ensure_ascii=False)
    # indent to match TS file
    indented_stats = ",\n    \"recurrenceStats\": " + formatted_stats.replace('\n', '\n    ')

    new_ts_code = ts_code.replace(target_str, target_str + indented_stats, 1)

    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(new_ts_code)

    print("Successfully injected recurrenceStats into mat-inf-puerp-01 in studyMaterialsData.ts!")

if __name__ == '__main__':
    main()

