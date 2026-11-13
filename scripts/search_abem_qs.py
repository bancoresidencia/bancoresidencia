import glob
from pypdf import PdfReader

queries = [
    "tosse, cansaço e “chiado no peito”",
    "chiado no peito",
    "mantido relações sexuais",
    "Lactente de 7 meses de idade, do sexo masculino"
]

for pdf in glob.glob('data/official_exams/ABEM/*.pdf'):
    try:
        reader = PdfReader(pdf)
        for i, page in enumerate(reader.pages):
            txt = (page.extract_text() or "").lower()
            for q in queries:
                if q.lower() in txt:
                    print(f"[ACHADO] '{q}' em {pdf} (página {i+1})!")
                    idx = txt.find(q.lower())
                    print(txt[max(0, idx - 50): min(len(txt), idx + 250)])
                    print("=" * 60)
    except Exception as e:
        pass

