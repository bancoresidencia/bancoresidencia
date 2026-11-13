import glob
from pypdf import PdfReader

kw = "repetição de exames físicos completos"
clean_kw = "repeticao de exames fisicos"

for pdf in glob.glob('data/official_exams/UERJ/*.pdf'):
    try:
        reader = PdfReader(pdf)
        for i, page in enumerate(reader.pages):
            txt = (page.extract_text() or "").lower()
            if "puericultura" in txt and ("exames físicos" in txt or "exames fisicos" in txt):
                print(f"[ACHADO] em {pdf} (página {i+1})!")
                idx = txt.find("puericultura")
                print(txt[max(0, idx - 50): min(len(txt), idx + 350)])
    except:
        pass

