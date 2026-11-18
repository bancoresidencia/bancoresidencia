import pypdf
import re

reader = pypdf.PdfReader('data/incoming_exams/SES_DF_2016/138RMUNIF_002_02.pdf')
full_text = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])

for num in range(6, 25):
    m = re.search(rf'(?:\n|^)\s*{num}\s+([A-ZÀ-Ú][^\n]+(?:\n[^\n]+){{0,4}})', full_text)
    if m:
        clean = ' '.join(m.group(0).split())
        print(f"Item {num}: {clean[:100]}...")
