import pypdf
import os
import glob

target = 'coqueluche'
files = glob.glob('data/official_exams/SES_GO_2026/PV_*.pdf') + glob.glob('data/official_exams/SES_GO/SES_GO_*.pdf')

print(f'Searching {len(files)} PDFs for "{target}"...')
for f in files:
    try:
        reader = pypdf.PdfReader(f)
        for i, page in enumerate(reader.pages):
            txt = page.extract_text()
            if target in txt.lower():
                print(f'FOUND in {os.path.basename(f)} (Page {i+1})!')
                for line in txt.split('\n'):
                    if target in line.lower():
                        print('  ->', line.strip())
    except Exception as e:
        pass
