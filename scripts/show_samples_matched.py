import json

with open('data/resultado_cruzamento_ajudamedico_10k.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

matches = data['matches']
print("Exemplo 1 (HSL/Sírio):")
print(json.dumps(matches[0], ensure_ascii=False, indent=2))
print("\nExemplo 2 (Santa Casa):")
sc = next(m for m in matches if 'Santa Casa' in m['institution'])
print(json.dumps(sc, ensure_ascii=False, indent=2))
print("\nExemplo 3 (UNIFESP):")
unifesp = next(m for m in matches if 'UNIFESP' in m['institution'])
print(json.dumps(unifesp, ensure_ascii=False, indent=2))
