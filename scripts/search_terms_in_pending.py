import json

with open('data/pending_sesgo_all.json', 'r', encoding='utf-8') as f:
    pendings = json.load(f)

for p in pendings:
    stmt = p['statement'].lower()
    for kw in ['escabiose', 'pediculose', 'crescimento', 'prematuridade', 'sarnat']:
        if kw in stmt:
            print(f"Match found in pendings: {p['code']} ({p['year']}) -> {stmt[:80]}")
