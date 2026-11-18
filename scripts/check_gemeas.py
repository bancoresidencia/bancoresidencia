import json

with open('data/staging_questoes_gemeas_locais.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

print("Tipo staging_questoes_gemeas_locais:", type(d))
if isinstance(d, list):
    print("Total:", len(d))
    if d:
        print("Sample keys:", list(d[0].keys()))
        print("Sample:", d[0])
elif isinstance(d, dict):
    print("Keys:", list(d.keys()))
