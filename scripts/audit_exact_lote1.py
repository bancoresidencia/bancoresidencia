import json, glob, sys
from collections import defaultdict
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# The official Lote 1 Top 10 institutions:
target_names = [
    'SES-PE',
    'Santa Casa de São Paulo',
    'AMRIGS',
    'SUS-SP',
    'IAMSPE',
    'USP',
    'UNESP',
    'FMABC',
    'UNIFESP'
]

files = glob.glob('data/*_final_questions.json')
exact_lote1 = defaultdict(lambda: defaultdict(lambda: {'total': 0, 'com_gab': 0, 'sem_gab': 0}))

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
            
        if not (2014 <= yr <= 2021):
            continue
            
        matched = None
        # Strict matching:
        if 'ses-pe' in inst.lower() or 'secretaria de estado da saúde de pernambuco' in inst.lower():
            matched = 'SES-PE'
        elif 'santa casa de são paulo' in inst.lower() or 'iscmsp' in inst.lower():
            matched = 'Santa Casa de São Paulo'
        elif 'amrigs' in inst.lower():
            matched = 'AMRIGS'
        elif 'sus-sp' in inst.lower():
            matched = 'SUS-SP'
        elif 'iamspe' in inst.lower():
            matched = 'IAMSPE'
        elif 'usp ribeir' in inst.lower() or 'hcrp' in inst.lower():
            matched = 'USP-RP'
        elif 'usp' in inst.lower() or 'universidade de são paulo' in inst.lower() or 'hcfmusp' in inst.lower():
            matched = 'USP'
        elif 'unesp' in inst.lower():
            matched = 'UNESP'
        elif 'fmabc' in inst.lower() or 'abc' in inst.lower() and 'medicina' in inst.lower():
            matched = 'FMABC'
        elif 'unifesp' in inst.lower() or 'paulista de medicina' in inst.lower():
            matched = 'UNIFESP'
            
        if matched:
            ans = str(q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper()
            is_anul = q.get('is_anulada') or q.get('isAnulada') or ('ANUL' in ans)
            d = exact_lote1[matched][yr]
            d['total'] += 1
            if is_anul or ans in ['A', 'B', 'C', 'D', 'E']:
                d['com_gab'] += 1
            else:
                d['sem_gab'] += 1

print("=== EXACT LOTE 1 (TOP 10) 2014-2021 AUDIT ===")
for inst in sorted(exact_lote1.keys()):
    print(f"\n--- {inst} ---")
    for yr in sorted(exact_lote1[inst].keys()):
        d = exact_lote1[inst][yr]
        pct = (d['com_gab'] / d['total'] * 100) if d['total'] > 0 else 0
        print(f"  {yr}: Total={d['total']:>3} | Com Gabarito={d['com_gab']:>3} | Sem Gabarito={d['sem_gab']:>3} | {pct:>5.1f}%")
