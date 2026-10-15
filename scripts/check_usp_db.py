import glob, json

files = glob.glob('data/*_final_questions.json')
usp_counts = {}
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    for q in data:
        inst = q.get('institution', '')
        yr = q.get('year')
        for target in ['USP', 'FMRP', 'HCRP', 'HCFMUSP']:
            if target in str(inst).upper():
                key = (inst, yr)
                if key not in usp_counts:
                    usp_counts[key] = {'total': 0, 'verified': 0}
                usp_counts[key]['total'] += 1
                if q.get('official_audit', {}).get('verified') or q.get('audit_trail'):
                    usp_counts[key]['verified'] += 1
                break

for k in sorted(usp_counts.keys(), key=lambda x: (str(x[0]), str(x[1]))):
    v = usp_counts[k]['verified']
    t = usp_counts[k]['total']
    pct = (v / t * 100) if t > 0 else 0
    print(f"{k[0]} ({k[1]}): {v}/{t} ({pct:.1f}%)")
