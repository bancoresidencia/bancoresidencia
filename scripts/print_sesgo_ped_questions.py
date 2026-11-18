import pypdf
import re

pdf_path = 'data/incoming_exams/SES_GO_2026/PV_SESGO_2026_VERSAO_A_R1_com_Pre-Requisito_em_Pediatria_ou_Pre-Requisito_em_Pediatria_ou_Gastroenterol.pdf'
reader = pypdf.PdfReader(pdf_path)
full_text = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])

# Let's find question numbers
matches = list(re.finditer(r'QUESTÃO\s+(\d+)', full_text, re.IGNORECASE))
print(f"Total QUESTÃO found: {len(matches)}")
for i, m in enumerate(matches[:10]):
    start = m.start()
    end = matches[i+1].start() if i+1 < len(matches) else start + 300
    snippet = ' '.join(full_text[start:end].split())
    print(f"\n{snippet[:180]}...")
