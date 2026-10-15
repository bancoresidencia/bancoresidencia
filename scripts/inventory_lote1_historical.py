import json
import glob
from collections import defaultdict

institutions = [
    'SES-PE', 'Santa Casa', 'AMRIGS', 'SUS-SP', 'IAMSPE',
    'USP', 'USP-RP', 'UNESP', 'FMABC', 'UNIFESP'
]

files = glob.glob('data/*_final_questions.json')
inventory = defaultdict(lambda: defaultdict(lambda: {'total': 0, 'has_ans': 0, 'no_ans': 0, 'anulada': 0}))
all_inst_names = defaultdict(int)

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        inst = q.get('institution', '')
        yr = q.get('year', 0)
        try:
            yr = int(yr)
        except:
            continue
            
        all_inst_names[inst] += 1
        
        # Check matching
        matched_target = None
        for target in institutions:
            if target.lower() in inst.lower():
                matched_target = target
                break
                
        if matched_target and 2014 <= yr <= 2021:
            ans = str(q.get('correct_answer') or q.get('correctAnswer') or q.get('answer') or '').strip().upper()
            is_anul = q.get('is_anulada') or q.get('isAnulada') or ('ANUL' in ans)
            d = inventory[matched_target][yr]
            d['total'] += 1
            if is_anul:
                d['anulada'] += 1
            elif ans in ['A', 'B', 'C', 'D', 'E']:
                d['has_ans'] += 1
            else:
                d['no_ans'] += 1

print("=== INVENTÁRIO 2014-2021 LOTE 1 NOS ARQUIVOS ATUAIS ===")
for inst in institutions:
    print(f"\n--- {inst} ---")
    years = sorted(inventory[inst].keys())
    if not years:
        print("  Nenhum registro encontrado entre 2014 e 2021")
    for yr in years:
        d = inventory[inst][yr]
        print(f"  {yr}: Total={d['total']:>4} | Com Gabarito={d['has_ans']:>4} | Anuladas={d['anulada']:>3} | Sem Gabarito={d['no_ans']:>4}")
