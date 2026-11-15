import pypdf
import os
import glob

target = 'vacina contra a dengue'
target2 = 'agente etiológico da coqueluche'

print(f'Searching ALL PDFs for "{target}"...')
for root, dirs, files in os.walk('data/official_exams'):
    for f in files:
        if f.lower().endswith('.pdf'):
            path = os.path.join(root, f)
            try:
                reader = pypdf.PdfReader(path)
                for i, page in enumerate(reader.pages):
                    txt = page.extract_text()
                    if txt and (target in txt.lower() or target2 in txt.lower()):
                        print(f"FOUND IN: {path} (Page {i+1})")
            except:
                pass
print("Done search.")
