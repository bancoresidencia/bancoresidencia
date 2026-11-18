import json

with open('data/analise_provas_gt20.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

print(f"Total provas >= 20: {len(d['provas_gt20'])}")
print("\n--- TOP 35 PROVAS COM MAIS GABARITOS FALTANTES ---")
for i, p in enumerate(d['provas_gt20'][:35], 1):
    inst = p['instituicao']
    banca = p.get('banca', '')
    ano = p['ano']
    tipo = p.get('tipo_prova', '')
    faltam = p['faltam']
    print(f"{i:2d}. {inst} ({ano}) - Banca: {banca} - Tipo: {tipo} -> Faltam: {faltam}")
