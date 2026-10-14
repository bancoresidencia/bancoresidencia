import json, glob, sys
from collections import defaultdict

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

targets = [
    'UFRGS', 'HCPA', 'IAMSPE', 'AMP', 'HUCFF', 'UFRJ',
    'AMRIGS', 'Einstein', 'SES-GO', 'PSU-MG', 'AREMG', 'SES-DF', 'BOS'
]

files = glob.glob('data/*_final_questions.json')
by_inst = defaultdict(lambda: {'total': 0, 'com_gabarito': 0, 'sem_gabarito': 0, 'by_year': defaultdict(lambda: {'total': 0, 'res': 0})})

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        for q in json.load(fp):
            inst = q.get('institution') or ''
            matched = False
            for t in targets:
                if t.lower() in inst.lower():
                    matched = True
                    break
            if matched:
                year = str(q.get('year', 'N/D'))
                ans = q.get('correct_answer') or q.get('correctAnswer') or ''
                is_anul = bool(q.get('is_annulled') or q.get('is_anulada') or ans in ['ANULADA', 'X'])
                has_ans = bool(ans and not is_anul)
                by_inst[inst]['total'] += 1
                by_inst[inst]['by_year'][year]['total'] += 1
                if has_ans or is_anul:
                    by_inst[inst]['com_gabarito'] += 1
                    by_inst[inst]['by_year'][year]['res'] += 1
                else:
                    by_inst[inst]['sem_gabarito'] += 1

print('=== CENSO DETALHADO LOTE 2 (ARQUIVOS FINAIS) ===')
for inst, s in sorted(by_inst.items(), key=lambda x: -x[1]['total'])[:15]:
    pct = (s['com_gabarito'] / s['total'] * 100) if s['total'] else 0
    print(f"\n📌 {inst}")
    print(f"   Total: {s['total']} | Gabaritadas: {s['com_gabarito']} ({pct:.1f}%) | Faltam: {s['sem_gabarito']}")
    for y in sorted(s['by_year'].keys()):
        y_info = s['by_year'][y]
        falta = y_info['total'] - y_info['res']
        print(f"     Ano {y}: {y_info['res']}/{y_info['total']} (faltam {falta})")
