import pypdf

reader_pv = pypdf.PdfReader('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf')
print("Page 1:")
print(reader_pv.pages[1].extract_text()[:600])
print("\nPage 2:")
print(reader_pv.pages[2].extract_text()[:600])
