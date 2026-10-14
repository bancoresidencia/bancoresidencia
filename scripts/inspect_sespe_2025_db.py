import json

files = [
    'data/clinica_medica_final_questions.json',
    'data/cirurgia_final_questions.json',
    'data/pediatria_final_questions.json',
    'data/ginecologia_final_questions.json',
    'data/medicina_preventiva_final_questions.json'
]

sespe_2025 = []
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        if q.get('institution') == 'SES-PE - Secretaria de Estado de Saúde de Pernambuco' and q.get('year') == 2025:
            sespe_2025.append({
                'file': f.split('/')[-1],
                'code': q.get('code'),
                'especialidade': q.get('especialidade'),
                'ans': q.get('correct_answer'),
                'statement': (q.get('statement') or '')[:80]
            })

print(f"Total SES-PE 2025 no banco: {len(sespe_2025)}")
for item in sespe_2025[:10]:
    print(item)
