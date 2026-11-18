import pypdf
import os

for fn in ['138RMUNIF_001_01.pdf', '138RMUNIF_002_02.pdf']:
    path = os.path.join('data/incoming_exams/SES_DF_2016', fn)
    reader = pypdf.PdfReader(path)
    txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    if 'síndromes infecciosas febris' in txt.lower():
        print(f"🎯 ENCONTRADO EM {fn}!")
        lines = [l.strip() for l in txt.split('\n') if 'síndromes infecciosas febris' in l.lower() or 'etiologias não infecciosas' in l.lower()]
        for l in lines:
            print("  ", l)
