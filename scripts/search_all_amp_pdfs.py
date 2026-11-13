import os
import glob
from pypdf import PdfReader

queries = {
    'AMP-2025-CIR-1946': 'manejo nutricional',
    'AMP-2025-CIR-4510': 'ferimento por arma branca em hemitórax',
    'AMP-2024-PED-0006': 'hospitalizado por broncoespasmo',
    'AMP-2019-CIR-5835': 'sensibilidade à palpação em quadrante inferior direito',
    'AMP-2017-CIR-6647': '6° dia pós-operatório de uma apendicectomia',
    'AMP-2017-PED-9858': 'queixas há duas semanas de febre, cefaleia, apatia',
    'AMP-2021-GIN-12812': 'queixa-se que nunca menstruou'
}

pdf_files = glob.glob('data/official_exams/AMP_PARANA/*.pdf')
print(f"Buscando em {len(pdf_files)} arquivos PDF da AMP...")

for pdf in pdf_files:
    if 'AMP_2024_PROVA_GERAL.pdf' in pdf: continue # already scanned as images
    try:
        reader = PdfReader(pdf)
        all_text = ""
        for i, page in enumerate(reader.pages):
            all_text += f"\n[P{i+1}] " + (page.extract_text() or "")
        
        for code, q in queries.items():
            # normalize search
            q_clean = q.lower().replace('-', ' ')
            if any(part in all_text.lower() for part in [q_clean, q_clean[:25]]):
                print(f"[ENCONTRADO] {code} em {pdf}!")
                idx = all_text.lower().find(q_clean[:20])
                print(all_text[max(0, idx - 100): min(len(all_text), idx + 200)])
    except Exception as e:
        pass

