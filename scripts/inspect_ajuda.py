import json

with open('data/knowledge/ajudamedico_consolidado_9223.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("Top level keys:", list(data.keys()))
if 'questoes' in data:
    print("Total questoes:", len(data['questoes']))
    first = data['questoes'][0]
    print("Exemplo 1:")
    for k, v in list(first.items())[:12]:
        print(f"  {k}: {str(v)[:100]}")
