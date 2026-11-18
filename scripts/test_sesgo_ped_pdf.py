import pypdf
import os

pdf_path = 'data/incoming_exams/SES_GO_2026/PV_SESGO_2026_VERSAO_A_R1_com_Pre-Requisito_em_Pediatria_ou_Pre-Requisito_em_Pediatria_ou_Gastroenterol.pdf'
reader = pypdf.PdfReader(pdf_path)
full_text = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()]).lower()

print(f"Total extracted chars: {len(full_text)}")
for term in ['coqueluche', 'febre reumática', 'calendário de vacinação', 'sbp']:
    if term in full_text:
        print(f"✅ Termo '{term}' ENCONTRADO!")
    else:
        print(f"❌ Termo '{term}' NÃO encontrado.")
