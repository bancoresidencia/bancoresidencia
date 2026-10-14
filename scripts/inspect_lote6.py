import json, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/mapeamento_instituicoes_gabaritos.json', 'r', encoding='utf-8') as f:
    mapping = json.load(f)

lote0 = [m for m in mapping if 'revalida' in m['instituicao'].lower() or 'enare' in m['instituicao'].lower() or 'enamed' in m['instituicao'].lower()]
others = [m for m in mapping if m not in lote0]

lote6 = others[50:60]

print("=== INSTITUIÇÕES DO LOTE 6 (POSIÇÃO 51 A 60) ===")
tot_q = 0
tot_res = 0
tot_faltam = 0
for i, item in enumerate(lote6, 51):
    q = item['total_questoes']
    res = item['total_resolvidas']
    faltam = item['sem_gabarito']
    tot_q += q
    tot_res += res
    tot_faltam += faltam
    pct = item['percentual']
    name = item['instituicao']
    print(f"{i}. {name[:48].ljust(48)} | Total: {str(q).rjust(4)} | Resolvidas: {str(res).rjust(4)} | Faltam: {str(faltam).rjust(4)} | {pct}%")

print("-" * 80)
print(f"TOTAL LOTE 6: {tot_q} questões | Resolvidas: {tot_res} ({tot_res/tot_q*100:.1f}%) | Faltam: {tot_faltam} questões")
