import pypdf
import re

path = 'data/incoming_exams/SES_GO_2026/PV_SESGO_2026_VERSAO_A_Areas_Basicas_e_Especialidades_de_Acesso_Direto__R1_.pdf'
reader = pypdf.PdfReader(path)
txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])

qs = list(re.finditer(r'QUESTÃO\s+(\d+)', txt, re.IGNORECASE))
print(f"Total QUESTÃO in PDF: {len(qs)}")
nums = [int(m.group(1)) for m in qs]
print("Question numbers found:", sorted(set(nums)))
