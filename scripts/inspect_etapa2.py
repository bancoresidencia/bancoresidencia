import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('data/relatorio_precoleta_etapas.json', encoding='utf-8') as f:
    d = json.load(f)

p2 = d['etapa2_oficial_banca']['provas']
print(f"Total de provas na Etapa 2: {len(p2)} (somam {sum(p['faltam'] for p in p2)} questoes faltantes)\n")
for idx, p in enumerate(p2):
    print(f"{idx+1:2d}. {p['ano']} | {p['instituicao'][:45]} | banca={p['banca'][:25]} | faltam={p['faltam']:3d} | portal={p.get('portal_oficial')}")
