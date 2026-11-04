#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os

path = r'C:\bancoresidencia\bancoresidencia\src\data\studyMaterialsData.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fix double comma
text = text.replace('"id": "mat-inf-puerp-01",,', '"id": "mat-inf-puerp-01",')

# 2. Fix missing comma after recurrenceStats closing bracket
text = text.replace('    }\n    "focusId":', '    },\n    "focusId":')
text = text.replace('    }\r\n    "focusId":', '    },\r\n    "focusId":')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed commas in studyMaterialsData.ts successfully!")

