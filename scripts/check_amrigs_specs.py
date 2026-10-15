import json, glob

files = glob.glob('data/*_final_questions.json')
for yr in [2020, 2021]:
    print(f"\n================ YEAR {yr} ================")
    db_qs = []
    for f in sorted(files):
        spec = f.split('/')[-1].replace('_final_questions.json', '')
        with open(f, 'r', encoding='utf-8') as fp:
            qs = json.load(fp)
        for q in qs:
            if 'amrigs' in q.get('institution', '').lower() and q.get('year') == yr:
                db_qs.append((spec, q))
    print(f"Total: {len(db_qs)}")
    by_spec = {}
    for spec, q in db_qs:
        by_spec.setdefault(spec, []).append(q)
    for spec, qs in by_spec.items():
        print(f"  {spec}: {len(qs)} questions")
        for q in qs[:2]:
            ans = q.get('correct_answer') or q.get('correctAnswer') or ''
            print(f"    Code: {q.get('code')} | Ans: '{ans}' | Stmt: {q.get('statement', '')[:60]}...")
