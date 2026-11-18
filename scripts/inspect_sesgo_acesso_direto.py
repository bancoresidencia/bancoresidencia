import pypdf
import os

path = 'data/incoming_exams/SES_GO_2026/PV_SESGO_2026_VERSAO_A_Areas_Basicas_e_Especialidades_de_Acesso_Direto__R1_.pdf'
if os.path.exists(path):
    reader = pypdf.PdfReader(path)
    print(f"Pages: {len(reader.pages)}")
    txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    print(f"Total extracted chars: {len(txt)}")
    print("First 500 chars:\n", txt[:500])
else:
    print("File not found!")
    # list all PV files
    print(os.listdir('data/incoming_exams/SES_GO_2026'))
