import pypdf, re

reader_pv = pypdf.PdfReader('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf')
# Start from page 2 (index 1)
txt_pv = '\n'.join([p.extract_text() for p in reader_pv.pages[1:] if p.extract_text()])
chunks = re.split(r'\n\s*(\d{1,3})\)\s+', txt_pv)
print("Chunks count from page 2:", len(chunks))
for i in range(1, 10, 2):
    print(f"\n--- Item {chunks[i]} ---")
    print(repr(chunks[i+1][:300]))
