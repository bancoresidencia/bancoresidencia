#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import json

base_dir = r'C:\bancoresidencia\bancoresidencia'
now_iso = "2026-11-03T15:17:13.826396+00:00"

# 1. Update data/analytics/infeccao-puerperal.json
json_path = os.path.join(base_dir, 'data', 'analytics', 'infeccao-puerperal.json')
if os.path.exists(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        d = json.load(f)
    d['lastRecalculatedAt'] = now_iso
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
    print("Updated infeccao-puerperal.json with lastRecalculatedAt")

# 2. Update src/data/studyMaterialsData.ts
ts_path = os.path.join(base_dir, 'src', 'data', 'studyMaterialsData.ts')
with open(ts_path, 'r', encoding='utf-8') as f:
    text = f.read()

target = '"certifiedAt": "2026-11-03T15:17:13.826396+00:00"'
replacement = '"certifiedAt": "2026-11-03T15:17:13.826396+00:00",\n        "lastRecalculatedAt": "2026-11-03T15:17:13.826396+00:00"'

if target in text and '"lastRecalculatedAt"' not in text:
    text = text.replace(target, replacement, 1)
    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Injected lastRecalculatedAt into studyMaterialsData.ts")


