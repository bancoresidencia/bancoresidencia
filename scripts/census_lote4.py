import json, glob, sys
from collections import defaultdict

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/mapeamento_instituicoes_gabaritos.json', 'r', encoding='utf-8') as f:
    mapping = json.load(f)

filtered = [item['instituicao'] for item in mapping if 'revalida' not in item['instituicao'].lower() and 'enare' not in item['instituicao'].lower() and 'enamed' not in item['instituicao'].lower()]

lote4_names = filtered[30:40]
print("=== INSTITUIÇÕES DO LOTE 4 ===")
for i, name in enumerate(lote4_names, 31):
    print(f"{i}. {name}")

files = glob.glob('data/*_final_questions.json')
stats = {inst: {'total': 0, 'com_gabarito': 0, 'sem_gabarito': 0, 'by_year': defaultdict(lambda: {'total': 0, 'com': 0, 'sem': 0})} for inst in lote4_names}

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        for q in json.load(fp):
            inst = q.get('institution')
            if inst in stats:
                stats[inst]['total'] += 1
                yr = str(q.get('year', 'N/D'))
                stats[inst]['by_year'][yr]['total'] += 1
                ans = q.get('correct_answer')
                if ans and str(ans).strip():
                    stats[inst]['com_gabarito'] += 1
                    stats[inst]['by_year'][yr]['com'] += 1
                else:
                    stats[inst]['sem_gabarito'] += 1
                    stats[inst]['by_year'][yr]['sem'] += 1

print("\n=== CENSO LOCAL (ARQUIVOS BRUTOS data/*_final_questions.json) ===")
total_all = 0
com_all = 0
sem_all = 0
for name in lote4_names:
    s = stats[name]
    total_all += s['total']
    com_all += s['com_gabarito']
    sem_all += s['sem_gabarito']
    pct = round(s['com_gabarito'] / s['total'] * 100, 1) if s['total'] else 0
    print(f"{name[:48].ljust(48)} | Total: {str(s['total']).rjust(4)} | Com Gabarito: {str(s['com_gabarito']).rjust(4)} | Faltam: {str(s['sem_gabarito']).rjust(4)} | {pct}%")

print("-" * 80)
pct_all = round(com_all / total_all * 100, 1) if total_all else 0
print(f"{'TOTAL LOTE 4 LOCAL'.ljust(48)} | Total: {str(total_all).rjust(4)} | Com Gabarito: {str(com_all).rjust(4)} | Faltam: {str(sem_all).rjust(4)} | {pct_all}%")
