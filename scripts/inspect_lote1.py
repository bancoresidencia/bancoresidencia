import json
import glob
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

institutions_lote_1 = [
    'SES-PE', 'UNIFESP', 'SUS-SP', 'FMABC', 'USP', 'AMRIGS', 'SANTA CASA', 'IAMSPE', 'UNESP'
]

files = glob.glob('data/*_final_questions.json')
all_insts = {}

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
        for q in data:
            inst = q.get('institution', 'UNKNOWN')
            year = q.get('year', 'UNKNOWN')
            ans = q.get('correct_answer')
            if inst not in all_insts:
                all_insts[inst] = {'total': 0, 'with_ans': 0, 'years': set(), 'by_year': {}}
            all_insts[inst]['total'] += 1
            if str(year) not in all_insts[inst]['by_year']:
                all_insts[inst]['by_year'][str(year)] = {'total': 0, 'with_ans': 0}
            all_insts[inst]['by_year'][str(year)]['total'] += 1
            if ans and str(ans).strip():
                all_insts[inst]['with_ans'] += 1
                all_insts[inst]['by_year'][str(year)]['with_ans'] += 1
            all_insts[inst]['years'].add(year)

print('=== INSTITUIÇÕES DO LOTE 1 NO BANCO DE QUESTÕES ===')
for k, v in sorted(all_insts.items(), key=lambda x: x[1]['total'], reverse=True):
    for target in institutions_lote_1:
        if target.lower() in k.lower():
            years_sorted = sorted(list(v['years']), key=lambda y: str(y))
            pending = v['total'] - v['with_ans']
            print(f"\n--- {k} ---")
            print(f"Total: {v['total']} | Com Gabarito: {v['with_ans']} | Pendente: {pending}")
            for yr in sorted(v['by_year'].keys()):
                info = v['by_year'][yr]
                print(f"   Ano {yr}: Total={info['total']} | Com Gabarito={info['with_ans']} | Faltando={info['total'] - info['with_ans']}")
            break
