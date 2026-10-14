import json, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/mapeamento_instituicoes_gabaritos.json', 'r', encoding='utf-8') as f:
    mapping = json.load(f)

lote0 = [m for m in mapping if 'revalida' in m['instituicao'].lower() or 'enare' in m['instituicao'].lower() or 'enamed' in m['instituicao'].lower()]
others = [m for m in mapping if m not in lote0]

chunk_size = 10
lotes = []
for i in range(0, len(others), chunk_size):
    lote_num = (i // chunk_size) + 1
    chunk = others[i:i + chunk_size]
    tot_q = sum(c['total_questoes'] for c in chunk)
    tot_res = sum(c['total_resolvidas'] for c in chunk)
    tot_faltam = sum(c['sem_gabarito'] for c in chunk)
    pct = round(tot_res / tot_q * 100, 1) if tot_q else 0
    if tot_faltam > 0:
        lotes.append({
            'lote': lote_num,
            'count_insts': len(chunk),
            'total_questoes': tot_q,
            'resolvidas': tot_res,
            'faltam': tot_faltam,
            'pct': pct,
            'insts_sample': [c['instituicao'].split(' - ')[0] for c in chunk[:4]]
        })

# Sort descending by missing questions
lotes_sorted = sorted(lotes, key=lambda x: x['faltam'], reverse=True)

print(f"Total de Lotes com Pendências: {len(lotes_sorted)} lotes\n")
print(f"{'Posição'.ljust(8)} | {'Lote'.ljust(8)} | {'Faltam'.rjust(7)} | {'Total Lote'.rjust(10)} | {'Resolvidas'.rjust(10)} | {'Cobertura'.rjust(9)} | Bancas Principais")
print("-" * 95)
for rank, l in enumerate(lotes_sorted, 1):
    sample = ', '.join(l['insts_sample'])
    pos = f"{rank}º".ljust(8)
    lote_label = f"Lote {l['lote']}".ljust(8)
    faltam_str = str(l['faltam']).rjust(7)
    tot_str = str(l['total_questoes']).rjust(10)
    res_str = str(l['resolvidas']).rjust(10)
    pct_str = (str(l['pct']) + "%").rjust(9)
    print(f"{pos} | {lote_label} | {faltam_str} | {tot_str} | {res_str} | {pct_str} | {sample}")
