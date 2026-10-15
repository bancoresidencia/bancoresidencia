import glob, json, sys
sys.stdout.reconfigure(encoding='utf-8')

files = glob.glob('data/*_final_questions.json')
pending_sus = []
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        inst = q.get('institution', '') or q.get('banca', '') or ''
        is_sus_ba = 'SUS-BA' in inst or 'SUSBA' in q.get('code', '')
        if is_sus_ba and (not q.get('correct_answer') or not q.get('correctAnswer')):
            pending_sus.append(q)

print(f'Total de pendências SUS-BA restantes: {len(pending_sus)}')
by_year = {}
for q in pending_sus:
    y = q.get('year')
    by_year[y] = by_year.get(y, 0) + 1
print('Por ano:', by_year)
print('Exemplos de 2023:')
for q in [x for x in pending_sus if x.get('year') == 2023][:6]:
    opts = q.get('options', [])
    print('Code:', q.get('code'), '| Options count:', len(opts), '| Statement:', q.get('statement')[:100].replace('\n', ' '))
print('Exemplos de 2025:')
for q in [x for x in pending_sus if x.get('year') == 2025][:6]:
    opts = q.get('options', [])
    print('Code:', q.get('code'), '| Options count:', len(opts), '| Statement:', q.get('statement')[:100].replace('\n', ' '))
