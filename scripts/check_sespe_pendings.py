import json

sfs = [
    'data/clinica_medica_final_questions.json',
    'data/cirurgia_final_questions.json',
    'data/pediatria_final_questions.json',
    'data/ginecologia_final_questions.json',
    'data/medicina_preventiva_final_questions.json',
    'data/obstetricia_final_questions.json',
    'data/urologia_final_questions.json'
]

for sf in sfs:
    qs = json.load(open(sf, 'r', encoding='utf-8'))
    for q in qs:
        if q.get('institution') == 'SES-PE - Secretaria de Estado de Saúde de Pernambuco':
            yr = q.get('year')
            ans = (q.get('correct_answer') or '').strip()
            if not ans and not q.get('is_anulada'):
                print(f"Pendente {yr} [{sf}]: id={q.get('id')} code={q.get('code')} statement={q.get('statement')[:80]}")
