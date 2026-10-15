import json, glob, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

files = glob.glob('data/*_final_questions.json')
unans_2020 = []
unans_2021 = []

for f in sorted(files):
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        inst = q.get('institution', '')
        yr = q.get('year')
        ans = str(q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper()
        is_anul = q.get('is_anulada') or q.get('isAnulada') or ('ANUL' in ans)
        if 'amrigs' in inst.lower() and not is_anul and ans not in ['A', 'B', 'C', 'D', 'E']:
            if yr == 2020:
                unans_2020.append((f.split('/')[-1], q))
            elif yr == 2021:
                unans_2021.append((f.split('/')[-1], q))

print(f"AMRIGS 2020 unanswered: {len(unans_2020)}")
for f, q in unans_2020[:10]:
    print(f"  [{f}] ID: {q.get('id')} | Code: {q.get('code')}")
    print(f"    Stmt: {q.get('statement', '')[:90].strip()}")

print(f"\nAMRIGS 2021 unanswered: {len(unans_2021)}")
for f, q in unans_2021[:10]:
    print(f"  [{f}] ID: {q.get('id')} | Code: {q.get('code')}")
    print(f"    Stmt: {q.get('statement', '')[:90].strip()}")
