import json
import pypdf
import os
import re

with open('data/pending_hub_2016.json', 'r', encoding='utf-8') as f:
    pendings = json.load(f)

q = pendings[1] # UNBHUB-2016-CLM-0743
print("Q code:", q['code'])
print("Q statement:\n", repr(q['statement']))

path = 'data/incoming_exams/SES_DF_2016/138RMUNIF_002_02.pdf'
reader = pypdf.PdfReader(path)
txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])

for l in txt.split('\n'):
    if 'infecciosas febris' in l.lower():
        print("PDF line:", repr(l))
    if 'etiologias não infecciosas' in l.lower():
        print("PDF line 2:", repr(l))
