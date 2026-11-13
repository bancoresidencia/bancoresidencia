import glob
from pypdf import PdfReader

kw = "apendicite aguda é a causa mais comum de abdome agudo"
clean_kw = "apendicite aguda e a causa mais comum"

for pdf in glob.glob('data/official_exams/**/*.pdf', recursive=True):
    try:
        reader = PdfReader(pdf)
        for i, page in enumerate(reader.pages):
            txt = (page.extract_text() or "").lower()
            if "apendicite aguda" in txt and "causa mais comum" in txt:
                print(f"[ACHADO] em {pdf} (página {i+1})!")
                idx = txt.find("apendicite aguda")
                print(txt[max(0, idx - 50): min(len(txt), idx + 250)])
    except:
        pass

