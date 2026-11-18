import glob
import pypdf
import os

all_pdfs = glob.glob('data/**/*.pdf', recursive=True)
print(f"Searching {len(all_pdfs)} PDFs for 'coqueluche'...")

for p in all_pdfs:
    try:
        reader = pypdf.PdfReader(p)
        for idx, page in enumerate(reader.pages):
            t = page.extract_text()
            if t and 'coqueluche' in t.lower():
                print(f"FOUND in {p} (Page {idx+1})!")
                # show snippet
                pos = t.lower().find('coqueluche')
                print("  Snippet:", t[max(0, pos-40):pos+120].replace('\n', ' '))
                break
    except:
        pass
