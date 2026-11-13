import glob
from pypdf import PdfReader

kw = "alta médica"
kw2 = "conselho tutelar"

for pdf in glob.glob('data/official_exams/**/*.pdf', recursive=True):
    try:
        reader = PdfReader(pdf)
        for i, page in enumerate(reader.pages):
            txt = (page.extract_text() or "").lower()
            if kw in txt or kw2 in txt:
                print(f"[ACHADO] em {pdf} (página {i+1})!")
                idx = txt.find(kw) if kw in txt else txt.find(kw2)
                print(txt[max(0, idx - 100): min(len(txt), idx + 200)])
    except:
        pass

