import json, glob, sys
from collections import defaultdict

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/mapeamento_instituicoes_gabaritos.json', 'r', encoding='utf-8') as f:
    mapping = json.load(f)

# Top 10 institutions (excl. Revalida, ENARE, ENAMED)
lote1_names = []
for item in mapping:
    inst = item['instituicao']
    il = inst.lower()
    if 'revalida' in il or 'enare' in il or 'enamed' in il:
        continue
    lote1_names.append(inst)
    if len(lote1_names) == 10:
        break

files = glob.glob('data/*_final_questions.json')
stats = {inst: {'total': 0, 'com_gabarito': 0, 'anuladas': 0, 'sem_gabarito': 0, 'por_ano': defaultdict(lambda: {'total': 0, 'resolvidas': 0, 'sem': 0})} for inst in lote1_names}

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
        for q in data:
            inst = q.get('institution')
            if inst in stats:
                year = str(q.get('year', 'N/D'))
                ans = q.get('correct_answer')
                ann = q.get('is_annulled', False)
                stats[inst]['total'] += 1
                stats[inst]['por_ano'][year]['total'] += 1
                if ann or ans == 'ANULADA':
                    stats[inst]['anuladas'] += 1
                    stats[inst]['por_ano'][year]['resolvidas'] += 1
                elif ans and str(ans).strip():
                    stats[inst]['com_gabarito'] += 1
                    stats[inst]['por_ano'][year]['resolvidas'] += 1
                else:
                    stats[inst]['sem_gabarito'] += 1
                    stats[inst]['por_ano'][year]['sem'] += 1

print("=== DIAGNÓSTICO EXATO DO LOTE 1 (10 INSTITUIÇÕES) ===")
for i, inst in enumerate(lote1_names, 1):
    s = stats[inst]
    pct = round((s['com_gabarito'] + s['anuladas']) / s['total'] * 100, 1) if s['total'] else 0
    print(f"\n[{i}] {inst}")
    print(f"    Total: {s['total']} | Gabarito Válido: {s['com_gabarito']} | Anuladas: {s['anuladas']} | Cobertura: {pct}% | Faltam: {s['sem_gabarito']}")
    anos_sorted = sorted(s['por_ano'].keys(), key=lambda x: str(x))
    for yr in anos_sorted:
        yinfo = s['por_ano'][yr]
        ypct = round(yinfo['resolvidas'] / yinfo['total'] * 100, 1) if yinfo['total'] else 0
        print(f"      Ano {yr}: Total={yinfo['total']} | Resolvidas={yinfo['resolvidas']} ({ypct}%) | Pendentes={yinfo['sem']}")
