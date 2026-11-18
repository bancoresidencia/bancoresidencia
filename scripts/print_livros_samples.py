import json

with open('data/resultado_livros_verificado.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

matches = d['matches']
print("Exemplo 1 (HMMSJP - Top 1 pendências):")
hmmsjp = next((m for m in matches if 'HMMSJP' in m['institution']), None)
if hmmsjp:
    print(json.dumps(hmmsjp, ensure_ascii=False, indent=2))

print("\nExemplo 2 (UERJ):")
uerj = next((m for m in matches if 'UERJ' in m['institution']), None)
if uerj:
    print(json.dumps(uerj, ensure_ascii=False, indent=2))

print("\nExemplo 3 (UNIFESO 100%):")
unifeso = next((m for m in matches if 'UNIFESO' in m['institution']), None)
if unifeso:
    print(json.dumps(unifeso, ensure_ascii=False, indent=2))
