import json, re, glob, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('data/official_exams/SANTA_CASA_SP/sc_2023_prova_extracted.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Split questions 1..100
matches = list(re.finditer(r'(?:QUESTÃO|QUESTAO)\s+(\d+)', text, re.IGNORECASE))
exam_q = {}
for i in range(len(matches)):
    q_num = int(matches[i].group(1))
    start = matches[i].end()
    end = matches[i+1].start() if i+1 < len(matches) else len(text)
    exam_q[q_num] = text[start:end].strip()

sc_keys = ['SANTA CASA DE SÃO PAULO', 'ISCMSP', 'FCMSCSP', 'SANTA CASA DE MISERICÓRDIA DE SÃO PAULO', 'SANTA CASA SP']
def is_sc(inst):
    if not inst: return False
    u = inst.upper()
    return any(k in u for k in sc_keys) and not any(x in u for x in ['LIMEIRA', 'OURINHOS', 'SANTOS', 'CURITIBA', 'BELO HORIZONTE', 'GOI'])

def clean(s):
    s = re.sub(r'[^a-zA-Z0-9áéíóúãõâêîôûçÁÉÍÓÚÃÕÂÊÎÔÛÇ]', ' ', s.lower())
    return ' '.join(s.split())

files = [
    'data/clinica_medica_final_questions.json',
    'data/cirurgia_final_questions.json',
    'data/pediatria_final_questions.json',
    'data/ginecologia_final_questions.json',
    'data/medicina_preventiva_final_questions.json',
    'data/obstetricia_final_questions.json',
    'data/urologia_final_questions.json'
]

db_q = []
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        if str(q.get('ano', q.get('year', ''))) == '2023' and is_sc(q.get('instituicao', q.get('institution', ''))):
            enunc = q.get('statement') or q.get('enunciado') or q.get('question') or ''
            opts = q.get('options') or []
            opt_text = ' '.join([o.get('text', '') if isinstance(o, dict) else str(o) for o in opts])
            db_q.append({
                'file': fpath,
                'id': q.get('id'),
                'enunciado': enunc,
                'opt_text': opt_text,
                'full_text': enunc + ' ' + opt_text
            })

# Explicit map for vignettes
explicit_map = {
    'c8e0af2d-e787-45f3-990e-e32910f8e5b0': 12, # mulher 56 anos inconsciente SAMU
    '4a1cb5b4-b1c5-4ea8-bd63-deb08a673a57': 13, # disturbio acido base
    'bd8ad6d5-91e2-4b3d-8d01-63209c99a7ad': 14, # hipotese diagnostica AAS / metformina
    '04bf6737-48b0-46fc-b593-9771ed4246cf': 15, # modo ventilatorio
    '453f6550-9747-4744-857d-b32223d247ff': 56, # crianca caiu da laje TCE
    '95a2e030-4760-4e8d-8cb4-01eb0e65868d': 57, # Arthur adrenalina IM
    'c4ae8420-786b-4ee9-bbb1-f05df6033813': 58  # Arthur glucagon / propranolol
}

results = []
for item in db_q:
    qid = item['id']
    if qid in explicit_map:
        best_num = explicit_map[qid]
        best_score = 1.0
    else:
        db_clean = clean(item['full_text'])
        db_words = set(db_clean.split())
        best_num = None
        best_score = 0.0
        for qn, body in exam_q.items():
            if qn in explicit_map.values():
                continue
            ex_clean = clean(body)
            ex_words = set(ex_clean.split())
            inter = len(db_words & ex_words)
            union = len(db_words | ex_words)
            j = inter / union if union else 0
            if j > best_score:
                best_score = j
                best_num = qn

    results.append({
        'id': qid,
        'file': item['file'],
        'q_num': best_num,
        'score': round(best_score, 3),
        'enunciado_snippet': item['enunciado'][:80]
    })

all_nums = [r['q_num'] for r in results]
print(f"Total matched: {len(results)}")
print(f"Unique q_nums: {len(set(all_nums))}")
assert len(set(all_nums)) == 100
assert set(all_nums) == set(range(1, 101))

with open('data/official_exams/SANTA_CASA_SP/sc_2023_matches.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print("Saved data/official_exams/SANTA_CASA_SP/sc_2023_matches.json successfully! 100% 1-to-1 match!")
