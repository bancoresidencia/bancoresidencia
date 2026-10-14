import json, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/mapeamento_instituicoes_gabaritos.json', 'r', encoding='utf-8') as f:
    mapping = json.load(f)

lote0 = [m for m in mapping if 'revalida' in m['instituicao'].lower() or 'enare' in m['instituicao'].lower() or 'enamed' in m['instituicao'].lower()]
others = [m for m in mapping if m not in lote0]

chunk_size = 10
all_lotes_data = {}

total_faltam_global = 0
total_questoes_global = 0

for lote_num in range(20, 27):
    start = (lote_num - 1) * chunk_size
    chunk = others[start:start + chunk_size]
    tot_q = sum(c['total_questoes'] for c in chunk)
    tot_res = sum(c['total_resolvidas'] for c in chunk)
    tot_faltam = sum(c['sem_gabarito'] for c in chunk)
    total_faltam_global += tot_faltam
    total_questoes_global += tot_q
    all_lotes_data[lote_num] = chunk
    print(f"\n=== LOTE {lote_num} (Total: {tot_q} | Resolvidas: {tot_res} | Faltam: {tot_faltam}) ===")
    for c in chunk:
        inst = c['instituicao']
        q = c['total_questoes']
        res = c['total_resolvidas']
        faltam = c['sem_gabarito']
        print(f"   • {inst[:50].ljust(52)} | Total: {str(q).rjust(3)} | Resolvidas: {str(res).rjust(3)} | Faltam: {str(faltam).rjust(3)}")

print("\n" + "=" * 80)
print(f"TOTAL GERAL LOTES 20 A 26: {total_questoes_global} questões | Faltam: {total_faltam_global} questões")
