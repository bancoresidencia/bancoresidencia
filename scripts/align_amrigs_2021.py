import json, glob, sys, re
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Official AMRIGS 2021 keys:
# Note: In the PDF:
# 1-20: C C D A C D A D C B D C B A B D C A D B
# 21-40: C B D B B C B C C D B C D C D C D C B D
# 41-60: D D D D C A D A D D B B A C A A C D C A
# 61-80: A B C A C D D A C C C A B D A A C D B D
# 81-100: B B C D A B A B A D A B A B C A C D B D

raw_2021 = """
C C D A C D A D C B D C B A B D C A D B
C B D B B C B C C D B C D C D C D C B D
D D D D C A D A D D B B A C A A C D C A
A B C A C D D A C C C A B D A A C D B D
B B C D A B A B A D A B A B C A C D B D
"""
keys = raw_2021.split() # 0-indexed: 0 to 99 (Q1 to Q100)

files = glob.glob('data/*_final_questions.json')
by_spec = {}
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        if 'amrigs' in q.get('institution', '').lower() and q.get('year') == 2021:
            code = q.get('code', '')
            m = re.search(r'(\d+)$', code)
            num = int(m.group(1)) if m else 0
            spec = f.split('/')[-1].replace('_final_questions.json', '')
            by_spec.setdefault(spec, []).append((num, q))

print("=== ALIGNMENT SEARCH ===")
for spec, items in sorted(by_spec.items()):
    if spec == 'data\\urologia': continue
    items.sort(key=lambda x: x[0])
    # Extract existing answers
    known = {}
    for idx, (num, q) in enumerate(items):
        ans = q.get('correct_answer') or q.get('correctAnswer') or ''
        is_anul = q.get('is_anulada') or q.get('isAnulada')
        if ans in ['A', 'B', 'C', 'D', 'E']:
            known[idx] = ans
    
    print(f"\nSpec {spec}: {len(items)} items, {len(known)} known answers")
    # Test all possible start positions in 1..100
    best_start = None
    best_matches = 0
    for start in range(1, 101 - len(items) + 1):
        matches = 0
        conflicts = 0
        for idx, ans in known.items():
            q_num = start + idx
            official_ans = keys[q_num - 1]
            if ans == official_ans:
                matches += 1
            else:
                conflicts += 1
        if conflicts == 0 and matches > best_matches:
            best_matches = matches
            best_start = start
    print(f"  Best start: Q{best_start} with {best_matches} matches (0 conflicts) out of {len(known)} known!")
