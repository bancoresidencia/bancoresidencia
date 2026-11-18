import pypdf

path = 'data/incoming_exams/SES_GO_2026/PV_SESGO_2026_VERSAO_A_Areas_Basicas_e_Especialidades_de_Acesso_Direto__R1_.pdf'
reader = pypdf.PdfReader(path)
txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])

for line in txt.split('\n'):
    if 'vestibular' in line.lower() or 'hints' in line.lower():
        print("Line:", repr(line))
