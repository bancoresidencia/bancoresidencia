import glob, json

files = glob.glob('data/*_final_questions.json')
uerj_qs = []

for f in files:
    spec = f.split('\\')[-1].replace('_final_questions.json', '')
    with open(f, 'r', encoding='utf-8') as fp:
        for q in json.load(fp):
            inst = q.get('institution') or ''
            banca = q.get('banca') or ''
            if 'uerj' in inst.lower() or 'uerj' in banca.lower():
                q['specialty'] = spec
                uerj_qs.append(q)

print(f"Total UERJ questions in local files: {len(uerj_qs)}")
by_year = {}
for q in uerj_qs:
    y = str(q.get('year', 'N/D'))
    by_year.setdefault(y, []).append(q)

for y in sorted(by_year.keys()):
    has_ans = sum(1 for q in by_year[y] if q.get('correct_answer') or q.get('correctAnswer'))
    print(f"  Ano {y}: {len(by_year[y])} questões (com gabarito: {has_ans}, faltam: {len(by_year[y]) - has_ans})")

if uerj_qs:
    sample = uerj_qs[0]
    print("\n--- SAMPLE UERJ QUESTION ---")
    print(f"ID: {sample.get('id')}")
    print(f"Code: {sample.get('code')}")
    print(f"Ano: {sample.get('year')}")
    print(f"Enunciado: {sample.get('statement', '')[:250]}")
    print(f"Options: {sample.get('options')}")
    print(f"Gabarito atual: {sample.get('correct_answer')}")
