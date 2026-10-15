import json, glob, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/drive_thematic_homologated_gold.json', 'r', encoding='utf-8') as f:
    drive_gold = json.load(f)

drive_map = {item['id']: item for item in drive_gold if 'id' in item}
print(f"Loaded {len(drive_map)} items from drive_thematic_homologated_gold")

files = glob.glob('data/*_final_questions.json')
institutions = ['SES-PE', 'Santa Casa', 'AMRIGS', 'SUS-SP', 'IAMSPE', 'USP', 'UNESP', 'FMABC', 'UNIFESP']

matches = {}
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        inst = q.get('institution', '')
        yr = q.get('year', 0)
        qid = q.get('id')
        for target in institutions:
            if target.lower() in inst.lower() and 2014 <= yr <= 2021:
                key = (target, yr)
                if qid in drive_map:
                    ans = drive_map[qid].get('official_answer')
                    matches[key] = matches.get(key, 0) + 1

print("\nMatches in drive_thematic_homologated_gold for 2014-2021 Lote 1:")
for k, count in sorted(matches.items()):
    print(f"  {k[0]} {k[1]}: {count}")
