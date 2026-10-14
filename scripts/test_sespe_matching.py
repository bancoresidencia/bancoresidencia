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

def extract_booklet_questions(pdf_path):
    reader = pypdf.PdfReader(pdf_path)
    full_text = '\n'.join([p.extract_text() or '' for p in reader.pages])
    pattern = r'(?:QUEST(?:ÃO|O|AO)\s+(\d{1,3})|(?:\n\s*(\d{1,3})\s*[\n\.-]))'
    splits = list(re.finditer(pattern, full_text, re.IGNORECASE))
    valid = []
    for m in splits:
        qn = m.group(1) or m.group(2)
        if qn:
            qn_int = int(qn)
            if 1 <= qn_int <= 100:
                valid.append((qn_int, m.start()))
    
    valid = sorted(valid, key=lambda x: x[1])
    questions = {}
    for i, (qn, s_idx) in enumerate(valid):
        e_idx = valid[i+1][1] if i+1 < len(valid) else len(full_text)
        if e_idx - s_idx > 30 and qn not in questions:
            questions[qn] = full_text[s_idx:e_idx]
    return questions

# 1. Testar SES-PE 2024
caderno_2024 = 'data/official_exams/SES_PE/SES_PE_2024_GR_01_-__REAS_B_SICAS_COM_ACESSO_DIRETO__2024.pdf'
gabarito_2024 = 'data/official_exams/SES_PE/SES_PE_2024_GABARITO_DEFINITIVO_ACESSO_DIRETO_2024_Repub.pdf'

extractor = IAUPEExtractor()
gb_res = extractor.extract(gabarito_2024)[0]
ans_map = {q.numero_questao: q.alternativa for q in gb_res.questoes}
print(f"Gabarito SES-PE 2024: {len(ans_map)} questões")

b_qs = extract_booklet_questions(caderno_2024)
print(f"Caderno SES-PE 2024: {len(b_qs)} questões identificadas no PDF")

# Indexa 7-grams do caderno
ngram_map = defaultdict(list)
for qn, q_text in b_qs.items():
    words = norm(q_text).split()
    if len(words) >= 7:
        for i in range(0, min(len(words) - 6, 40), 2):
            ng = ' '.join(words[i:i+7])
            ngram_map[ng].append(qn)

print(f"Indexados {len(ngram_map)} n-grams do caderno 2024")

# Testa matching contra o banco
files = [
    'data/clinica_medica_final_questions.json',
    'data/cirurgia_final_questions.json',
    'data/pediatria_final_questions.json',
    'data/ginecologia_final_questions.json',
    'data/medicina_preventiva_final_questions.json'
]

matches_found = 0
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        if q.get('institution') == 'SES-PE - Secretaria de Estado de Saúde de Pernambuco' and q.get('year') == 2024:
            st = norm(q.get('statement') or '')
            w = st.split()
            if len(w) < 7: continue
            hits = defaultdict(int)
            for i in range(0, min(len(w) - 6, 40), 2):
                ng = ' '.join(w[i:i+7])
                if ng in ngram_map:
                    for qn in ngram_map[ng]:
                        hits[qn] += 1
            if hits:
                best_qn, cnt = max(hits.items(), key=lambda x: x[1])
                if cnt >= 3:
                    matches_found += 1

print(f"Total de questões SES-PE 2024 encontradas e casadas no banco: {matches_found}")
