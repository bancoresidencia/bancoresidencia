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

files = [
    'data/clinica_medica_final_questions.json',
    'data/cirurgia_final_questions.json',
    'data/pediatria_final_questions.json',
    'data/ginecologia_final_questions.json',
    'data/medicina_preventiva_final_questions.json'
]

db_qs_by_year = defaultdict(list)
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        if q.get('institution') == 'SES-PE - Secretaria de Estado de Saúde de Pernambuco':
            db_qs_by_year[q.get('year')].append(q)

for yr, cd_fn, gb_fn in [
    (2025, 'SES_PE_2025_GR_01_ACESSO.pdf', 'SES_PE_2025_GABARITO_DEFINITIVO_ACESSO_DIRETO_2025.pdf'),
    (2026, 'SES_PE_2026_GR_01_ACESSO.pdf', 'SES_PE_2026_GABARITO_DEFINITIVO_ACESSO_DIRETO_2026.pdf')
]:
    print(f"\n==================== SES-PE {yr} ====================")
    b_qs = extract_booklet_100(f'data/official_exams/SES_PE/{cd_fn}')
    gb_res = extractor.extract(f'data/official_exams/SES_PE/{gb_fn}')[0]
    ans_map = {q.numero_questao: q.alternativa for q in gb_res.questoes}

    print(f"Caderno extraído: {len(b_qs)} questões | Gabarito extraído: {len(ans_map)} respostas")

    # Indexa n-grams
    ngram_map = defaultdict(list)
    for qn, q_text in b_qs.items():
        words = norm(q_text).split()
        if len(words) >= 7:
            for i in range(0, min(len(words) - 6, 40), 2):
                ng = ' '.join(words[i:i+7])
                ngram_map[ng].append(qn)

    db_list = db_qs_by_year[yr]
    print(f"Questões no banco para o ano {yr}: {len(db_list)}")

    matched = 0
    resolved_now = 0
    for q in db_list:
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
            best_qn, count = max(hits.items(), key=lambda x: x[1])
            if count >= 3:
                matched += 1
                official_ans = ans_map.get(best_qn)
                curr_ans = q.get('correct_answer')
                if not curr_ans or not str(curr_ans).strip():
                    resolved_now += 1

    print(f"Total de questões do banco casadas: {matched} / {len(db_list)} ({round(matched/len(db_list)*100, 1)}%)")
    print(f"Questões pendentes que recebem gabarito oficial agora: {resolved_now}")
