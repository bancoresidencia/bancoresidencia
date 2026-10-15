import json, glob, sys, re
from collections import defaultdict
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

files = glob.glob('data/*_final_questions.json')
by_spec_yr = defaultdict(lambda: defaultdict(list))

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        inst = q.get('institution', '')
        yr = q.get('year')
        if 'amrigs' in inst.lower() and yr in [2020, 2021]:
            code = q.get('code', '')
            m = re.search(r'(\d+)$', code)
            num = int(m.group(1)) if m else 0
            spec = q.get('especialidade') or f.split('/')[-1].replace('_final_questions.json', '')
            by_spec_yr[yr][spec].append((num, q))

for yr in [2020, 2021]:
    print(f"\n================ YEAR {yr} ================")
    for spec, items in sorted(by_spec_yr[yr].items()):
        items.sort(key=lambda x: x[0])
        nums = [x[0] for x in items]
        print(f"Spec: {spec:<25} | Count: {len(items):>2} | Min: {nums[0]} | Max: {nums[-1]} | Sequential: {nums == list(range(nums[0], nums[-1]+1))}")
