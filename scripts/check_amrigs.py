import json
from collections import defaultdict

sfs = [
    'data/clinica_medica_final_questions.json',
    'data/cirurgia_final_questions.json',
    'data/pediatria_final_questions.json',
    'data/ginecologia_final_questions.json',
    'data/medicina_preventiva_final_questions.json',
    'data/obstetricia_final_questions.json',
    'data/urologia_final_questions.json'
]
by_year = defaultdict(lambda: {'total': 0, 'with_ans': 0, 'pending': 0})
for sf in sfs:
    qs = json.load(open(sf, 'r', encoding='utf-8'))
    for q in qs:
        if 'AMRIGS' in (q.get('institution') or ''):
            yr = q.get('year')
            has_ans = bool((q.get('correct_answer') or '').strip() or q.get('is_anulada'))
            by_year[yr]['total'] += 1
            if has_ans:
                by_year[yr]['with_ans'] += 1
            else:
                by_year[yr]['pending'] += 1

print('=== INVENTÁRIO AMRIGS NO BANCO ===')
for yr in sorted(by_year.keys(), key=lambda x: str(x)):
    d = by_year[yr]
    print(f"Ano {yr}: Total={d['total']} | Com Gabarito={d['with_ans']} | Pendentes={d['pending']}")
