import json, glob, sys, re
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

raw_2020 = """
D B C * A D D A A C A B C D D C D D * *
C A D B B C C D D D * B C C B A B A * A
C B D B D D A C * C A C * C * A * D A B
B B B A C A B D C C A C C C * B D B A A
B D D D D D * A B B D * A A A D C D C B
"""
keys_2020 = raw_2020.split() # 0-indexed: 0 to 99

files = glob.glob('data/*_final_questions.json')
by_spec = {}
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        if 'amrigs' in q.get('institution', '').lower() and q.get('year') == 2020:
            code = q.get('code', '')
            m = re.search(r'(\d+)$', code)
            num = int(m.group(1)) if m else 0
            spec = f.split('/')[-1].replace('_final_questions.json', '')
            by_spec.setdefault(spec, []).append((num, q))

print("=== AMRIGS 2020 ALIGNMENT SEARCH ===")
for spec, items in sorted(by_spec.items()):
    items.sort(key=lambda x: x[0])
    known = {}
    for idx, (num, q) in enumerate(items):
        ans = q.get('correct_answer') or q.get('correctAnswer') or ''
        is_anul = q.get('is_anulada') or q.get('isAnulada')
        if ans in ['A', 'B', 'C', 'D', 'E']:
            known[idx] = ans
        elif is_anul:
            known[idx] = '*'
    
    print(f"\nSpec {spec}: {len(items)} items, {len(known)} known answers")
    best_start = None
    best_matches = 0
    for start in range(1, 101 - len(items) + 1):
        matches = 0
        conflicts = 0
        for idx, ans in known.items():
            q_num = start + idx
            official_ans = keys_2020[q_num - 1]
            if ans == official_ans:
                matches += 1
            else:
                conflicts += 1
        if conflicts == 0 and matches > best_matches:
            best_matches = matches
            best_start = start
    print(f"  Best start: Q{best_start} with {best_matches} matches (0 conflicts) out of {len(known)} known!")
