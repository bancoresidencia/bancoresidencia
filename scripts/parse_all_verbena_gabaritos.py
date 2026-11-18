import os
import pypdf
import re

folder = 'data/incoming_exams/SES_GO_2026'

def parse_verbena_gb(path):
    reader = pypdf.PdfReader(path)
    txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    
    lines = [l.strip() for l in txt.split('\n') if l.strip()]
    answers = {}
    current_nums = []
    
    for l in lines:
        # Check if line is numbers, e.g. "01 02 03 04 05" or "1 2 3 4 5"
        tokens = l.split()
        if all(t.isdigit() for t in tokens) and len(tokens) >= 2:
            current_nums = [int(t) for t in tokens]
            continue
            
        # Check if line is letters, e.g. "C B B D C"
        if current_nums and len(tokens) == len(current_nums) and all(t in ('A', 'B', 'C', 'D', 'X', '*') for t in tokens):
            for num, ans in zip(current_nums, tokens):
                answers[num] = ans
            current_nums = []
            
    return answers

gb_files = sorted([f for f in os.listdir(folder) if f.startswith('GB_') and f.endswith('.pdf')])
print(f"Total GB files: {len(gb_files)}")

for f in gb_files:
    path = os.path.join(folder, f)
    ans = parse_verbena_gb(path)
    print(f"{f[:60]}... -> {len(ans)} answers parsed (max q: {max(ans.keys()) if ans else 0})")
