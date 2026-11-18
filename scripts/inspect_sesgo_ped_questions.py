import json

with open('data/pending_sesgo_all.json', 'r', encoding='utf-8') as f:
    pendings = json.load(f)

p_ped = [q for q in pendings if q['year'] == 2026 and q.get('especialidade') == 'Pediatria']
print(f"Total Pediatria 2026: {len(p_ped)}")

for q in p_ped:
    print(f"\n[{q['code']}] {q['statement']}")
    for opt in q['options']:
        print(f"  ({opt['letter']}) {opt['text']}")
