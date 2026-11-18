import pypdf
import os
import re
import json

folder = 'data/incoming_exams/SES_DF_2016'

def get_official_answers(gab_filename):
    path = os.path.join(folder, gab_filename)
    reader = pypdf.PdfReader(path)
    txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    
    rows = []
    for l in txt.split('\n'):
        chars = [c for c in l if c in ('C', 'E', 'X')]
        if len(chars) == 20:
            rows.append(chars)
            
    print(f"{gab_filename}: found {len(rows)} rows of 20 answers")
    if len(rows) != 6:
        print(f"  WARNING: expected 6 rows of 20, got {len(rows)}")
        
    ans_map = {}
    for r_idx, row in enumerate(rows):
        for c_idx, ch in enumerate(row):
            q_num = r_idx * 20 + c_idx + 1
            ans_map[q_num] = ch
            
    return ans_map

# Test for 001_01 and 002_02
gab_001 = get_official_answers('GAB_DEFINITIVO_138RMUNIF_001_01.PDF')
gab_002 = get_official_answers('GAB_DEFINITIVO_138RMUNIF_002_02.PDF')

print("001_01 total items:", len(gab_001))
print("002_02 total items:", len(gab_002))
print("002_02 items 1..10:", [gab_002[i] for i in range(1, 11)])
print("002_02 items 41..50:", [gab_002[i] for i in range(41, 51)])
