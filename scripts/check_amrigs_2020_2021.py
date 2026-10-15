import json, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

files = [
    'data/clinica_medica_final_questions.json',
    'data/cirurgia_final_questions.json',
    'data/pediatria_final_questions.json',
    'data/ginecologia_final_questions.json',
    'data/medicina_preventiva_final_questions.json',
    'data/obstetricia_final_questions.json'
]

for yr in [2020, 2021]:
    all_q = []
    for fpath in files:
        with open(fpath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        for q in data:
            if 'AMRIGS' in (q.get('institution') or '').upper() and q.get('year') == yr:
                all_q.append({
                    'file': fpath,
                    'id': q.get('id'),
                    'code': q.get('code'),
                    'ans': q.get('correct_answer'),
                    'stmt': q.get('statement', '')[:90].replace('\n', ' ')
                })
    unans = [q for q in all_q if not q['ans']]
    ans = [q for q in all_q if q['ans']]
    print(f"\n=== AMRIGS {yr} (Total: {len(all_q)} | Ans: {len(ans)} | Unans: {len(unans)}) ===")
    for idx, q in enumerate(unans[:10], 1):
        print(f"  {idx:02d}. [{q['code']}] {q['stmt']}")
