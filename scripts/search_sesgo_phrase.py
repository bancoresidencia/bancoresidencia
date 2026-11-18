import os
import pypdf

folder = 'data/incoming_exams/SES_GO_2026'
files = [f for f in os.listdir(folder) if f.endswith('.pdf')]
print(f"Scanning {len(files)} PDFs in SES_GO_2026...")

for f in files:
    path = os.path.join(folder, f)
    reader = pypdf.PdfReader(path)
    txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()]).lower()
    if 'coqueluche' in txt:
        print(f"🎯 ENCONTRADO EM {f}!")
        lines = [l.strip() for l in txt.split('\n') if 'coqueluche' in l]
        for l in lines[:3]:
            print(f"   {l}")
