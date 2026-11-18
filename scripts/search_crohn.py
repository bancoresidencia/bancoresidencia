import os
import pypdf

folder = 'data/incoming_exams/SES_GO_2026'
for f in sorted(os.listdir(folder)):
    if f.startswith('PV_') and f.endswith('.pdf'):
        reader = pypdf.PdfReader(os.path.join(folder, f))
        txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
        if 'doença de crohn' in txt.lower() or 'crohn' in txt.lower():
            print(f"🎯 ENCONTRADO EM {f}!")
            for l in txt.split('\n'):
                if 'crohn' in l.lower():
                    print("  ", l.strip())
