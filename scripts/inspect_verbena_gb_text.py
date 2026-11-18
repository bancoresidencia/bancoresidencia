import pypdf

path = 'data/incoming_exams/SES_GO_2026/GB_SESGO_2026_VERSAO_A_Areas_Basicas_e_Especialidades_de_Acesso_Direto__R1_.pdf'
reader = pypdf.PdfReader(path)
txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
print(f"Pages: {len(reader.pages)}, Chars: {len(txt)}")
print("--- Text dump ---")
for i, l in enumerate(txt.split('\n')[:40]):
    print(f"{i:2d}: {repr(l)}")
