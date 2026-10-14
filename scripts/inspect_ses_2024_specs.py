import json, glob

files = glob.glob('data/*_final_questions.json')
by_spec = {}
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        if q.get('institution') == 'SES-PE - Secretaria de Estado de Saúde de Pernambuco' and q.get('year') == 2024:
            ans = (q.get('correct_answer') or '').strip()
            ann = q.get('is_anulada')
            spec = q.get('especialidade')
            if spec not in by_spec:
                by_spec[spec] = {'total': 0, 'with_ans': 0, 'without_ans': 0}
            by_spec[spec]['total'] += 1
            if ans or ann:
                by_spec[spec]['with_ans'] += 1
            else:
                by_spec[spec]['without_ans'] += 1

print('SES-PE 2024 por especialidade:')
for k, v in by_spec.items():
    print(f"  {k}: Total={v['total']}, Com={v['with_ans']}, Sem={v['without_ans']}")
