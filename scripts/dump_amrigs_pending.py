import json, glob, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

files = glob.glob('data/*_final_questions.json')
pending_2020 = []
pending_2021 = []

for f in sorted(files):
    spec = f.split('/')[-1].replace('_final_questions.json', '')
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        inst = q.get('institution', '')
        yr = q.get('year')
        ans = str(q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper()
        is_anul = q.get('is_anulada') or q.get('isAnulada') or ('ANUL' in ans)
        if 'amrigs' in inst.lower() and not is_anul and ans not in ['A', 'B', 'C', 'D', 'E']:
            info = {
                'file': f,
                'spec': spec,
                'id': q.get('id'),
                'code': q.get('code'),
                'statement': q.get('statement', '').strip(),
                'options': q.get('options', {})
            }
            if yr == 2020:
                pending_2020.append(info)
            elif yr == 2021:
                pending_2021.append(info)

print(f"AMRIGS 2020 Pending: {len(pending_2020)}")
print(f"AMRIGS 2021 Pending: {len(pending_2021)}")

with open('data/amrigs_2020_pending.json', 'w', encoding='utf-8') as fp:
    json.dump(pending_2020, fp, ensure_ascii=False, indent=2)

with open('data/amrigs_2021_pending.json', 'w', encoding='utf-8') as fp:
    json.dump(pending_2021, fp, ensure_ascii=False, indent=2)

print("Saved pending lists to data/amrigs_2020_pending.json and data/amrigs_2021_pending.json")
