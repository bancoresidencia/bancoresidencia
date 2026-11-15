import pypdf
import os
import glob

target = 'coqueluche'
files = glob.glob('data/official_exams/SES_GO*/**/*.pdf', recursive=True)
print(f'Total SES_GO PDFs: {len(files)}')

for f in files:
    try:
        reader = pypdf.PdfReader(f)
        for i, page in enumerate(reader.pages):
            txt = page.extract_text()
            if txt and target in txt.lower():
                print(f'FOUND in {os.path.basename(f)} (Page {i+1})!')
    except Exception as e:
        pass
