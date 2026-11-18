import pypdf
import os
import re

folder = 'data/incoming_exams/SES_DF_2016'
for f in os.listdir(folder):
    if f.lower().endswith('.pdf'):
        path = os.path.join(folder, f)
        reader = pypdf.PdfReader(path)
        txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
        print(f"=== {f} ({len(reader.pages)} pages, {len(txt)} chars) ===")
        # if it's gabarito
        if 'gab' in f.lower():
            lines = [l.strip() for l in txt.split('\n') if l.strip()]
            print("First 20 lines:")
            for l in lines[:20]:
                print("  ", l)
