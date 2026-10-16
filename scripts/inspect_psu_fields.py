import glob, json

files = glob.glob('data/*_final_questions.json')

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
        for q in qs:
            inst = q.get('institution') or ''
            year = q.get('year')
            if 'psu' in inst.lower() and year in [2024, 2025]:
                print(f"[{year}] ID: {q.get('id')}")
                print(f"  institution: {q.get('institution')}")
                print(f"  banca: {q.get('banca')}")
                print(f"  correct_answer: {q.get('correct_answer')}")
                print(f"  keys in q: {list(q.keys())}")
                print(f"  statement start: {q.get('statement', '')[:120]}")
                break
