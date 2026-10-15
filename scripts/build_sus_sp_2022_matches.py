import json, re, glob, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('data/official_exams/SUS_SP/sus_sp_2022_prova_extracted.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'Q\s*U\s*E\s*S\s*T\s*[\u00C3\uFFFDAA]O\s+(\d+)', re.IGNORECASE)
matches = list(pattern.finditer(text))

exam_q = {}
for i in range(len(matches)):
    q_num = int(matches[i].group(1))
    start = matches[i].end()
    end = matches[i+1].start() if i+1 < len(matches) else len(text)
    exam_q[q_num] = text[start:end].strip()

print(f"Parsed {len(exam_q)} questions from official SUS-SP 2022 exam.")

def is_sus_sp(inst):
    if not inst: return False
    u = inst.upper()
    return 'SUS-SP' in u or 'SUS - SP' in u or 'SISTEMA ÚNICO DE SAÚDE - SP' in u or 'SELEÇÃO UNIFICADA PARA RESIDÊNCIA MÉDICA DO ESTADO DE SÃO PAULO' in u

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
        if str(q.get('ano', q.get('year', ''))) == '2022' and is_sus_sp(q.get('instituicao', q.get('institution', ''))):
            enunc = q.get('statement') or q.get('enunciado') or q.get('question') or ''
            opts = q.get('options') or []
            opt_text = ' '.join([o.get('text', '') if isinstance(o, dict) else str(o) for o in opts])
            db_q.append({
                'file': fpath,
                'id': q.get('id'),
                'enunciado': enunc,
                'full_text': enunc + ' ' + opt_text,
                'ans': q.get('correct_answer') or q.get('correctAnswer')
            })

print(f"Loaded {len(db_q)} SUS-SP 2022 questions from DB.")

results = []
for item in db_q:
    db_clean = clean(item['full_text'])
    db_words = set(db_clean.split())
    best_num = None
    best_score = 0.0
    for qn, body in exam_q.items():
        ex_clean = clean(body)
        ex_words = set(ex_clean.split())
        inter = len(db_words & ex_words)
        union = len(db_words | ex_words)
        j = inter / union if union else 0
        if j > best_score:
            best_score = j
            best_num = qn

    results.append({
        'id': item['id'],
        'file': item['file'],
        'q_num': best_num,
        'score': round(best_score, 3),
        'enunciado_snippet': item['enunciado'][:80]
    })

all_nums = [r['q_num'] for r in results]
print(f"Total matched: {len(results)}")
print(f"Unique q_nums: {len(set(all_nums))}")
from collections import Counter
c = Counter(all_nums)
dups = {k: v for k, v in c.items() if v > 1}
if dups:
    print('Duplicates:', dups)

missing = set(range(1, 101)) - set(all_nums)
if missing:
    print('Missing numbers in 1..100:', missing)

with open('data/official_exams/SUS_SP/sus_sp_2022_matches.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print("Saved data/official_exams/SUS_SP/sus_sp_2022_matches.json!")
