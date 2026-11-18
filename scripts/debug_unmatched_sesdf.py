import json
import pypdf
import os
import re

folder = 'data/incoming_exams/SES_DF_2016'
with open('data/pending_hub_2016.json', 'r', encoding='utf-8') as f:
    pendings = json.load(f)

# Unmatched from earlier
unmatched_codes = [
    'UNBHUB-2016-CLM-6005', 'UNBHUB-2016-CLM-8806', 'UNBHUB-2016-CLM-10140',
    'UNBHUB-2016-CLM-12695', 'UNBHUB-2016-CLM-16035'
]

exam_files = sorted([f for f in os.listdir(folder) if f.startswith('138RMUNIF_') and f.endswith('.pdf')])
exams_text = {}
for ef in exam_files:
    reader = pypdf.PdfReader(os.path.join(folder, ef))
    exams_text[ef] = ' '.join([p.extract_text() for p in reader.pages if p.extract_text()]).lower()

for q in pendings:
    if q['code'] in unmatched_codes:
        print(f"\n--- Checking {q['code']} ---")
        stmt = q['statement'].lower()
        print(f"Stmt: {stmt[:120]}")
        
        # Test word n-grams
        words = re.findall(r'\b\w+\b', stmt)
        found = False
        for n in [6, 5, 4]:
            for i in range(len(words) - n + 1):
                gram = ' '.join(words[i:i+n])
                for ef, txt in exams_text.items():
                    if gram in txt:
                        print(f"  Matched gram '{gram}' in {ef}!")
                        found = True
                        break
                if found:
                    break
            if found:
                break
        if not found:
            print("  NO N-GRAM MATCH in any of the 8 PDFs!")
