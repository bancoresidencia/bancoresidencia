import os, sys, json, re, unicodedata
sys.path.insert(0, os.path.abspath('.'))

import pypdf
from collections import defaultdict

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def norm(text):
    if not text: return ''
    text = unicodedata.normalize('NFKD', text)
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r'[^a-zA-Z0-9]', ' ', text).lower()
    return re.sub(r'\s+', ' ', text).strip()

def extract_booklet_100(pdf_path):
    reader = pypdf.PdfReader(pdf_path)
    full_text = '\n'.join([p.extract_text() or '' for p in reader.pages])
    pattern = r'(?:(?:\n|\A)\s*(\d{2,3})\.\s+)'
    matches = list(re.finditer(pattern, full_text))
    
    questions = {}
    for i, m in enumerate(matches):
        qn = int(m.group(1))
        if 1 <= qn <= 100:
            s_idx = m.start()
            e_idx = matches[i+1].start() if i+1 < len(matches) else len(full_text)
            questions[qn] = full_text[s_idx:e_idx]
    return questions

b_qs = extract_booklet_100('data/official_exams/SES_PE/SES_PE_2025_GR_01_ACESSO.pdf')

# Check Clinica Medica
with open('data/clinica_medica_final_questions.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

ses_cm = [q for q in qs if q.get('institution') == 'SES-PE - Secretaria de Estado de Saúde de Pernambuco' and q.get('year') == 2025]
print(f"Total Clinica Medica SES-PE 2025 no banco: {len(ses_cm)}")

for i, q in enumerate(ses_cm[:5], 1):
    st_raw = q.get('statement') or ''
    st_norm = norm(st_raw)
    print(f"\n[Banco Q{i}] {st_raw[:100]}")
    # Compare with booklet questions 1 to 20
    best_sim = (None, 0)
    for qn in range(1, 21):
        b_txt = norm(b_qs.get(qn, ''))
        # Overlapping words
        w_b = set(b_txt.split())
        w_q = set(st_norm.split())
        overlap = len(w_b & w_q)
        if overlap > best_sim[1]:
            best_sim = (qn, overlap)
    print(f"   Melhor similaridade no caderno: Q{best_sim[0]} com {best_sim[1]} palavras em comum")
    print(f"   Texto caderno Q{best_sim[0]}: {b_qs.get(best_sim[0], '')[:120].replace(chr(10), ' ')}")
