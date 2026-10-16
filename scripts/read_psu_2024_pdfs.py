import pypdf

def read_pdf(path):
    print(f"=== {path} ===")
    reader = pypdf.PdfReader(path)
    print(f"Pages: {len(reader.pages)}")
    for i, page in enumerate(reader.pages):
        txt = page.extract_text() or ''
        print(f"--- Page {i+1} (chars {len(txt)}) ---")
        print(txt[:1000])

read_pdf('data/official_exams/PSU_MG/PSU_MG_2024_GABARITO_PRELIMINAR_TIPO1.pdf')
print("\n" + "="*50 + "\n")
read_pdf('data/official_exams/PSU_MG/PSU_MG_2024_ALTERACAO_GABARITO_DEFINITIVO.pdf')
