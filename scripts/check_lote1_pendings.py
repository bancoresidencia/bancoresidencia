import json, glob, sys
from collections import defaultdict

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/mapeamento_instituicoes_gabaritos.json', 'r', encoding='utf-8') as f:
    mapping = json.load(f)

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
pendentes = {inst: defaultdict(list) for inst in lote1_names}

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        inst = q.get('institution')
        if inst in pendentes:
            ans = (q.get('correct_answer') or '').strip()
            ann = q.get('is_anulada') or q.get('isAnulada')
            if not ans and not ann:
                yr = str(q.get('year', 'N/D'))
                pendentes[inst][yr].append(q)

print("=== PENDÊNCIAS EXATAS POR ANO - LOTE 1 ===")
for i, inst in enumerate(lote1_names, 1):
    print(f"\n[{i}] {inst}")
    total_inst_pend = sum(len(v) for v in pendentes[inst].values())
    print(f"    Total pendente: {total_inst_pend}")
    for yr in sorted(pendentes[inst].keys()):
        print(f"      Ano {yr}: {len(pendentes[inst][yr])} questões pendentes")
