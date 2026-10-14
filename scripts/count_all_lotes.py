import json, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/mapeamento_instituicoes_gabaritos.json', 'r', encoding='utf-8') as f:
    mapping = json.load(f)

# Lote 0 = Revalida e ENARE
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
    lotes.append({
        'lote': lote_num,
        'count_insts': len(chunk),
        'total_questoes': tot_q,
        'resolvidas': tot_res,
        'faltam': tot_faltam,
        'pct': pct,
        'concluido': tot_faltam == 0,
        'insts': [c['instituicao'] for c in chunk]
    })

print(f"Total de Instituições Mapeadas: {len(mapping)}")
print(f"Lote 0 (Revalida/ENARE): {len(lote0)} exames (100% CONCLUÍDO)")
print(f"Total de Lotes Regulares (10 instituições cada): {len(lotes)} lotes\n")

concluidos = [l for l in lotes if l['concluido']]
pendentes = [l for l in lotes if not l['concluido']]

print(f"Lotes 100% Concluídos: {len(concluidos)} lotes")
print(f"Lotes Restantes (que faltam): {len(pendentes)} lotes\n")

print("=== DETALHAMENTO DE TODOS OS LOTES ===")
for l in lotes:
    status = "CONCLUÍDO (100%)" if l['concluido'] else f"FALTAM {str(l['faltam']).rjust(4)} questões"
    icon = "[OK]" if l['concluido'] else "[..]"
    print(f"Lote {str(l['lote']).rjust(2)}: {icon} {status} | Total: {str(l['total_questoes']).rjust(4)} | Resolvidas: {str(l['resolvidas']).rjust(4)} ({str(l['pct']).rjust(5)}%)")
