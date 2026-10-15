import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/all_homologated_questions_gold.json', 'r', encoding='utf-8') as f:
    gold = json.load(f)

insts = sorted(set(q.get('institution') for q in gold if q.get('institution')))
targets = ['SES-PE', 'UNIFESP', 'SUS-SP', 'FMABC', 'USP/HC', 'AMRIGS', 'SANTA CASA', 'IAMSPE', 'UNESP']

for t in targets:
    print(f"\n=== TARGET: {t} ===")
    matches = [i for i in insts if t.lower() in i.lower()]
    for m in matches:
        all_q = [q for q in gold if q.get('institution') == m]
        res = [q for q in all_q if q.get('correct_answer') or q.get('gabarito_oficial')]
        years = sorted(set(q.get('year') for q in all_q))
        print(f"  Institution: '{m}'")
        print(f"  Total: {len(all_q)} | Resolved: {len(res)} ({len(res)/len(all_q)*100:.1f}%)")
        print("  By year (resolved/total):")
        for y in sorted(years):
            y_all = [q for q in all_q if q.get('year') == y]
            y_res = [q for q in y_all if q.get('correct_answer') or q.get('gabarito_oficial')]
            print(f"    {y}: {len(y_res)}/{len(y_all)}")
