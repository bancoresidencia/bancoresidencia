import json, glob, sys
from collections import defaultdict
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

files = glob.glob('data/*_final_questions.json')
by_modality = defaultdict(lambda: defaultdict(int))
institutions_found = set()

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        inst = q.get('institution', '')
        yr = q.get('year')
        if 'santa casa' in inst.lower() and yr in [2020, 2021]:
            institutions_found.add(inst)
            mod = q.get('modalidade') or q.get('tipo_prova') or 'N/A'
            spec = q.get('especialidade') or 'N/A'
            has_ans = bool(q.get('correct_answer') or q.get('correctAnswer') or q.get('is_anulada'))
            key = f"{yr} | {inst} | Mod: {mod} | Spec: {spec}"
            by_modality[key]['total'] += 1
            if has_ans:
                by_modality[key]['has_ans'] += 1
            else:
                by_modality[key]['no_ans'] += 1

print(f"Institutions found: {institutions_found}")
print("\nBreakdown of Santa Casa 2020-2021:")
for k, v in sorted(by_modality.items()):
    print(f"  {k} -> Total: {v['total']} | Com Gab: {v['has_ans']} | Sem Gab: {v['no_ans']}")
