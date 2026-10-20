import json
from collections import Counter

with open('data/relatorio_precoleta_etapas.json', encoding='utf-8') as f:
    d = json.load(f)

print("=== TOP 30 INSTITUICOES EM ETAPA 3 ===")
e3_insts = Counter(p['instituicao'] for p in d['etapa3_sites_avulsos']['provas'])
for inst, cnt in e3_insts.most_common(30):
    faltam_sum = sum(p['faltam'] for p in d['etapa3_sites_avulsos']['provas'] if p['instituicao'] == inst)
    print(f"{cnt} provas | {faltam_sum} faltantes | {inst}")

print("\n=== TOP 20 INSTITUICOES EM PROVA DE RESIDENCIA (PAGO) ===")
pago_insts = Counter(p['instituicao'] for p in d['pdr_bloqueado_pago']['provas'])
for inst, cnt in pago_insts.most_common(20):
    faltam_sum = sum(p['faltam'] for p in d['pdr_bloqueado_pago']['provas'] if p['instituicao'] == inst)
    print(f"{cnt} provas | {faltam_sum} faltantes | {inst}")

print("\n=== TODAS AS 14 PROVAS DA ETAPA 1 (PROVA DE RESIDENCIA ACESSIVEL) ===")
for p in d['etapa1_provaderesidencia']['provas']:
    pm = p['pdr_match']
    print(f"{p['ano']} | {p['instituicao']} | {p['banca']} | faltam={p['faltam']} | PDR: [{pm['badge']}] {pm['titulo']} (SQLite: {pm['ja_extraida_sqlite']}, {pm['questoes_sqlite']} qs)")
