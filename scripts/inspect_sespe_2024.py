import json, glob

files = glob.glob('data/*_final_questions.json')
ses_2024 = []
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        if q.get('institution') == 'SES-PE - Secretaria de Estado de Saúde de Pernambuco' and q.get('year') == 2024:
            ses_2024.append({
                'id': q.get('id'),
                'code': q.get('code'),
                'spec': q.get('especialidade'),
                'ans': q.get('correct_answer'),
                'is_anulada': q.get('is_anulada'),
                'source': q.get('official_source'),
                'statement': (q.get('statement') or '')[:70]
            })

print(f"Total SES-PE 2024 no banco: {len(ses_2024)}")
with_ans = [q for q in ses_2024 if q['ans'] or q['is_anulada']]
without_ans = [q for q in ses_2024 if not (q['ans'] or q['is_anulada'])]
print(f"Com resposta: {len(with_ans)} | Sem resposta: {len(without_ans)}")
print("\nAmostra com resposta:")
for q in with_ans[:5]:
    print(q)
print("\nAmostra sem resposta:")
for q in without_ans[:5]:
    print(q)
