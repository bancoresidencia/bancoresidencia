import pypdf

reader = pypdf.PdfReader('d:/bancoresidencia/data/enare_test/enare_2023_gabarito.pdf')

for idx, page in enumerate(reader.pages):
    txt = page.extract_text() or ""
    if "ACESSO DIRETO" in txt.upper() or "T361" in txt.upper() or "1361" in txt.upper():
        print(f"Page {idx+1}: {txt[:200].strip()}")
