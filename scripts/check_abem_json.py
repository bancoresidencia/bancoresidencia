import json

with open('data/abem_gabaritos_2024_2025_2026.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

for yr in d:
    print(f"\nAno {yr}:")
    keys = list(d[yr].keys())
    print(f"  Total provas/chaves: {len(keys)}")
    if keys:
        k0 = keys[0]
        print(f"  Exemplo {k0}:", type(d[yr][k0]), str(d[yr][k0])[:200])
