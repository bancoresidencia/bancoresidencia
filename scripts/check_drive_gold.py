import json, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/drive_thematic_homologated_gold.json', 'r', encoding='utf-8') as f:
    gold = json.load(f)

print(f"Total items in drive_thematic_homologated_gold: {len(gold)}")

sample = gold[0] if gold else {}
print("Sample keys:", list(sample.keys()))

institutions = ['SES-PE', 'Santa Casa', 'AMRIGS', 'SUS-SP', 'IAMSPE', 'USP', 'UNESP', 'FMABC', 'UNIFESP']
counts = {}

for q in gold:
    inst = q.get('institution', '')
    yr = q.get('year', 0)
    for target in institutions:
        if target.lower() in inst.lower():
            if 2014 <= yr <= 2021:
                key = (target, yr)
                counts[key] = counts.get(key, 0) + 1

print("\nQuestions in drive_thematic_homologated_gold (2014-2021):")
for (target, yr), count in sorted(counts.items()):
    print(f"  {target} {yr}: {count}")
