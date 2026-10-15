import json, glob

files = glob.glob('data/*_final_questions.json')
amrigs_qs = []

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        inst = q.get('institution', '')
        yr = q.get('year')
        if 'amrigs' in inst.lower() and yr in [2020, 2021]:
            amrigs_qs.append((f, q))

print(f"Total AMRIGS 2020-2021 questions found: {len(amrigs_qs)}")
by_year = {}
for f, q in amrigs_qs:
    yr = q.get('year')
    by_year.setdefault(yr, []).append((f, q))

for yr in sorted(by_year.keys()):
    qs = by_year[yr]
    print(f"Year {yr}: {len(qs)} questions")
    for f, q in qs[:5]:
        print(f"  File: {f.split('/')[-1]} | ID: {q.get('id')} | Code: {q.get('code')} | Ans: {q.get('correct_answer')} | Anulada: {q.get('is_anulada')}")
        stmt = q.get('statement', '')[:80].replace('\n', ' ')
        print(f"    Stmt: {stmt}")
