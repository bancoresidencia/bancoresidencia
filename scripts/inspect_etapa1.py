import json

with open('data/relatorio_precoleta_etapas.json', encoding='utf-8') as f:
    d = json.load(f)

p1 = d['etapa1_disponivel_pdr']['provas']
ja_tem = [p for p in p1 if 'Sim' in p['pdr_sqlite']]
a_coletar = [p for p in p1 if 'Sim' not in p['pdr_sqlite']]

print("=== ETAPA 1: DETALHAMENTO PROVA DE RESIDENCIA (LIBERADAS) ===")
print(f"Total na Etapa 1: {len(p1)} provas ({sum(p['faltam'] for p in p1):,} questoes faltantes)")
print(f"  -> Ja baixadas no SQLite local (prontas para match): {len(ja_tem)} provas ({sum(p['faltam'] for p in ja_tem):,} questoes faltantes)")
print(f"  -> A baixar via crawler no site: {len(a_coletar)} provas ({sum(p['faltam'] for p in a_coletar):,} questoes faltantes)")

print("\n--- Top 15 Provas JA BAIXADAS no SQLite (Match Imediato) ---")
ja_tem.sort(key=lambda x: x['faltam'], reverse=True)
for p in ja_tem[:15]:
    print(f"Ano {p['ano']} | {p['instituicao'][:45]} | Faltam: {p['faltam']:3d} | PDR [{p['pdr_badge']}] ID {p['pdr_id']} ({p['pdr_sqlite']})")

print("\n--- Provas A BAIXAR via Crawler no site ---")
a_coletar.sort(key=lambda x: x['faltam'], reverse=True)
for p in a_coletar[:15]:
    print(f"Ano {p['ano']} | {p['instituicao'][:45]} | Faltam: {p['faltam']:3d} | PDR [{p['pdr_badge']}] ID {p['pdr_id']}")
