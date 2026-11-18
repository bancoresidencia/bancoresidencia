import json

with open('data/pending_sesgo_all.json', 'r', encoding='utf-8') as f:
    pendings = json.load(f)

p2026 = [q for q in pendings if q['year'] == 2026]
print(f"Total 2026: {len(p2026)}")

# Group by specialty
by_spec = {}
for q in p2026:
    s = q.get('especialidade') or 'Sem especialidade'
    by_spec.setdefault(s, []).append(q)

for s, qs in by_spec.items():
    print(f"\n=== {s} ({len(qs)} questões) ===")
    for q in qs[:5]:
        print(f"  [{q['code']}] {q['statement'][:100]}")
