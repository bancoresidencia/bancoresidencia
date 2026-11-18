import os
import pypdf
import json
import re

folder = 'data/incoming_exams/SES_GO_2026'
pdf_files = sorted([f for f in os.listdir(folder) if f.startswith('PV_') and f.endswith('.pdf')])

with open('data/pending_sesgo_all.json', 'r', encoding='utf-8') as f:
    pendings = json.load(f)

p2026 = [q for q in pendings if q['year'] == 2026]
print(f"Total pendências 2026: {len(p2026)}")
print(f"Total PDFs de prova (PV_): {len(pdf_files)}")

# Check each PV file
for pv in pdf_files:
    path = os.path.join(folder, pv)
    reader = pypdf.PdfReader(path)
    txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()]).lower()
    
    # Check how many of the 92 match in this txt
    matches = []
    for q in p2026:
        stmt = q['statement'].lower()
        words = re.findall(r'\b\w+\b', stmt)
        if len(words) >= 5:
            phrase = ' '.join(words[:5])
            if phrase in txt:
                matches.append(q['code'])
                
    if matches:
        print(f"🎯 {pv}: {len(matches)} questões casadas! (ex: {matches[:3]})")
