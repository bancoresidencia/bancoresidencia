import glob
import pypdf

targets = [
    'anatomia hep',
    'polidr',
    'cochrane',
    'puericultura',
    'perímetro cef',
    'perimetro cef'
]

for pf in glob.glob('data/official_exams/AMRIGS/*.pdf'):
    if 'gabarito' in pf.lower():
        continue
    try:
        reader = pypdf.PdfReader(pf)
        txt = ''
        for p in reader.pages:
            txt += p.extract_text() + '\n'
        for t in targets:
            if t in txt.lower():
                print(f"FOUND '{t}' in {pf}")
    except:
        pass
