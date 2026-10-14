import os, sys, json, re, unicodedata
sys.path.insert(0, os.path.abspath('.'))

import pypdf
from collections import defaultdict
from coletor_gabaritos.extractors.iaupe_extractor import IAUPEExtractor

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def norm(text):
    if not text: return ''
    text = unicodedata.normalize('NFKD', text)
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r'[^a-zA-Z0-9]', ' ', text).lower()
    return re.sub(r'\s+', ' ', text).strip()

def get_tokens(text):
    # Tokens com mais de 3 letras normalizados
    return set([w for w in norm(text).split() if len(w) >= 4])

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

extractor = IAUPEExtractor()
gb_res = extractor.extract('data/official_exams/SES_PE/SES_PE_2025_GABARITO_DEFINITIVO_ACESSO_DIRETO_2025.pdf')[0]
ans_map = {q.numero_questao: q.alternativa for q in gb_res.questoes}
b_qs = extract_booklet_100('data/official_exams/SES_PE/SES_PE_2025_GR_01_ACESSO.pdf')

booklet_tokens = {qn: get_tokens(txt) for qn, txt in b_qs.items()}

files = [
    'data/clinica_medica_final_questions.json',
    'data/cirurgia_final_questions.json',
    'data/pediatria_final_questions.json',
    'data/ginecologia_final_questions.json',
    'data/medicina_preventiva_final_questions.json'
]

db_qs_2025 = []
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        if q.get('institution') == 'SES-PE - Secretaria de Estado de Saúde de Pernambuco' and q.get('year') == 2025:
            db_qs_2025.append(q)

print(f"Total de questões no banco para SES-PE 2025: {len(db_qs_2025)}")

perfect_matches = 0
unmatched = []

for q in db_qs_2025:
    q_toks = get_tokens(q.get('statement') or '')
    if len(q_toks) < 4:
        continue
    best_qn = None
    best_jaccard = 0.0
    for qn, b_toks in booklet_tokens.items():
        inter = len(q_toks & b_toks)
        union = len(q_toks | b_toks)
        jaccard = inter / union if union > 0 else 0
        if jaccard > best_jaccard:
            best_jaccard = jaccard
            best_qn = qn

    if best_jaccard >= 0.35 and best_qn is not None:
        perfect_matches += 1
    else:
        unmatched.append((q.get('code'), best_jaccard, (q.get('statement') or '')[:70]))

print(f"Casamentos perfeitos encontrados: {perfect_matches} / {len(db_qs_2025)} ({round(perfect_matches/len(db_qs_2025)*100, 1)}%)")
if unmatched:
    print(f"Não casadas ({len(unmatched)}):")
    for code, jc, snippet in unmatched[:5]:
        print(f"   {code} (Jaccard={round(jc, 2)}): {snippet}")
