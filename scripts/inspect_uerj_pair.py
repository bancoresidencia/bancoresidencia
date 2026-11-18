import pypdf

reader_pv = pypdf.PdfReader('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf')
txt_pv = '\n'.join([p.extract_text() for p in reader_pv.pages if p.extract_text()])
print(f"UERJ 2024 PV length: {len(txt_pv)}")
print("Sample PV:", txt_pv[:500])

reader_gb = pypdf.PdfReader('data/official_exams/UERJ/UERJ_2024_GABARITO_DEFINITIVO.pdf')
txt_gb = '\n'.join([p.extract_text() for p in reader_gb.pages if p.extract_text()])
print(f"\nUERJ 2024 GB length: {len(txt_gb)}")
print("Sample GB:", txt_gb[:500])
