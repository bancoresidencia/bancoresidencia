import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

fpath = os.path.join(DATA_DIR, 'cirurgia_final_questions.json')
with open(fpath, 'r', encoding='utf-8') as f:
    questions = json.load(f)

idor_q = [q for q in questions if 'IDOR' in (q.get('banca') or '') and q.get('year') == 2024]
if not idor_q:
    fpath = os.path.join(DATA_DIR, 'clinica_medica_final_questions.json')
    with open(fpath, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    idor_q = [q for q in questions if 'IDOR' in (q.get('banca') or '') and q.get('year') == 2024]

print(f"Total IDOR 2024: {len(idor_q)}")
if idor_q:
    q = idor_q[0]
    print(f"[{q.get('code')}] ans: {q.get('correctAnswer') or q.get('correct_answer')}")
    print('Statement:', q.get('statement')[:200])
    for opt in q.get('options', []):
        print(f"  {opt.get('letter')}: {opt.get('text')}")
