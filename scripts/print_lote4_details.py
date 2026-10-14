import json, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/mapeamento_instituicoes_gabaritos.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

filtered = [d for d in data if 'revalida' not in d['instituicao'].lower() and 'enare' not in d['instituicao'].lower() and 'enamed' not in d['instituicao'].lower()]

print("--- LOTE 4 ITEMS (ranking 31 to 40) ---")
tot_q = 0
tot_res = 0
tot_faltam = 0
for i, item in enumerate(filtered[30:40], 31):
    q = item['total_questoes']
    res = item['total_resolvidas']
    faltam = item['sem_gabarito']
    tot_q += q
    tot_res += res
    tot_faltam += faltam
    pct = item['percentual']
    print(f"{i}. {item['instituicao']}")
    print(f"   Total: {q} - Resolvidas: {res} - Faltam: {faltam} - Cobertura: {pct}%")

print("-" * 60)
print(f"TOTAL LOTE 4 (Meta na plataforma): {tot_q} questões")
print(f"TOTAL RESOLVIDAS: {tot_res} ({tot_res/tot_q*100:.1f}%)")
print(f"FALTAM PARA A META: {tot_faltam} questões")
