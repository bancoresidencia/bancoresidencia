import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

fpath = os.path.join(DATA_DIR, 'clinica_medica_final_questions.json')
with open(fpath, 'r', encoding='utf-8') as f:
    questions = json.load(f)

hrac_q = [q for q in questions if 'HRAC' in (q.get('banca') or '') and q.get('year') == 2025]
print(f"Total HRAC 2025 em Clínica Médica: {len(hrac_q)}")
q = next((q for q in hrac_q if q.get('code') == 'HRACUSPCENTR-2025-CLM-0452'), hrac_q[0] if hrac_q else None)
if q:
    print('Statement:', q.get('statement')[:200])
    print('Answer:', q.get('correctAnswer') or q.get('correct_answer'))
    for opt in q.get('options', []):
        print(f"  {opt.get('letter')}: {opt.get('text')}")
