import glob
import json

files = glob.glob('data/*_final_questions.json')
total = 0
verified = 0
by_inst = {}

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    for q in data:
        total += 1
        is_v = bool(q.get('official_audit', {}).get('is_verified'))
        if is_v:
            verified += 1
        inst = q.get('institution', 'Outros')
        if inst not in by_inst:
            by_inst[inst] = {'total': 0, 'verified': 0, 'by_year': {}}
        by_inst[inst]['total'] += 1
        if is_v:
            by_inst[inst]['verified'] += 1
        y = str(q.get('year', 'Unknown'))
        if y not in by_inst[inst]['by_year']:
            by_inst[inst]['by_year'][y] = {'total': 0, 'verified': 0}
        by_inst[inst]['by_year'][y]['total'] += 1
        if is_v:
            by_inst[inst]['by_year'][y]['verified'] += 1

print(f"Total: {total}, Verified: {verified} ({verified*100/total:.2f}%)")
lote1 = ['USP-SP', 'USP-RP', 'UNICAMP', 'UNIFESP', 'SUS-SP', 'IAMSPE', 'ENARE', 'AMRIGS', 'SCMSP', 'UERJ']
for inst in lote1:
    d = by_inst.get(inst, {'total': 0, 'verified': 0, 'by_year': {}})
    pct = (d['verified'] * 100 / d['total']) if d['total'] else 0
    print(f"=== {inst}: {d['verified']}/{d['total']} ({pct:.1f}%) ===")
    for y in sorted(d['by_year'].keys()):
        yd = d['by_year'][y]
        if yd['verified'] < yd['total']:
            print(f"   {y}: {yd['verified']}/{yd['total']}")
