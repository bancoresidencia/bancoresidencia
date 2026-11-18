import pypdf, re

reader_pv = pypdf.PdfReader('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf')
txt_pv = '\n'.join([p.extract_text() for p in reader_pv.pages if p.extract_text()])
chunks = re.split(r'\n\s*(\d{1,3})\)\s+', txt_pv)
print("Raw chunk 2 (Question 1):")
print(repr(chunks[2][:600]))
