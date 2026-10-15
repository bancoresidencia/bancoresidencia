import json, glob, sys, re
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# AMRIGS 2021 Official Keys 1-100:
raw_2021 = """
C C D A C D A D C B D C B A B D C A D B
C B D B B C B C C D B C D C D C D C B D
D D D D C A D A D D B B A C A A C D C A
A B C A C D D A C C C A B D A A C D B D
B B C D A B A B A D A B A B C A C D B D
"""
keys_2021 = {i+1: ans for i, ans in enumerate(raw_2021.split())}

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

print("=== CHECKING ANSWER PATTERNS FOR AMRIGS 2021 ===")
for spec, items in sorted(by_spec.items()):
    items.sort(key=lambda x: x[0])
    ans_seq = []
    for num, q in items:
        ans = q.get('correct_answer') or q.get('correctAnswer') or ''
        is_anul = q.get('is_anulada') or q.get('isAnulada')
        ans_seq.append((num, '*' if is_anul else (ans or '?')))
    print(f"\nSpec: {spec} ({len(items)} questions)")
    print("  " + " ".join([f"{n}:{a}" for n, a in ans_seq]))
