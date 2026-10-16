import glob, json

files = glob.glob('data/*_final_questions.json')
psu_questions = []

for f in files:
    spec = f.split('\\')[-1].replace('_final_questions.json', '')
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
        for q in qs:
            inst = q.get('institution') or ''
            banca = q.get('banca') or ''
            if 'psu-mg' in inst.lower() or 'psu-mg' in banca.lower() or 'aremg' in inst.lower() or 'aremg' in banca.lower():
                q['specialty'] = spec
                psu_questions.append(q)

print(f"Total PSU-MG questions in local final files: {len(psu_questions)}")
by_year = {}
for q in psu_questions:
    y = str(q.get('year', 'N/D'))
    by_year.setdefault(y, []).append(q)

for y in sorted(by_year.keys()):
    has_ans = sum(1 for q in by_year[y] if q.get('correct_answer') or q.get('correctAnswer'))
    print(f"  Ano {y}: {len(by_year[y])} questões (com gabarito: {has_ans}, faltam: {len(by_year[y]) - has_ans})")

# Sample question statement and options
if psu_questions:
    sample = psu_questions[0]
    print("\n--- SAMPLE QUESTION ---")
    print(f"ID: {sample.get('id')}")
    print(f"Ano: {sample.get('year')}")
    print(f"Inst: {sample.get('institution')}")
    print(f"Banca: {sample.get('banca')}")
    print(f"Enunciado: {sample.get('statement', '')[:300]}")
    opts = sample.get('options')
    print(f"Options: {list(opts.keys()) if isinstance(opts, dict) else len(opts)}")
