import glob, pypdf

for p in glob.glob('data/official_exams/**/*.pdf', recursive=True):
    try:
        reader = pypdf.PdfReader(p)
        for idx, pg in enumerate(reader.pages):
            t = pg.extract_text()
            if t and ('urina avermelhada' in t.lower() or '1.850 gramas' in t.lower() or 'transtorno opositor' in t.lower()):
                print(f"FOUND in {p} (Page {idx+1})!")
                break
    except:
        pass
