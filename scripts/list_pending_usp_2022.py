import json, glob, sys
sys.stdout.reconfigure(encoding='utf-8')

usp_keys = ['USP', 'HCFMUSP', 'FACULDADE DE MEDICINA DA UNIVERSIDADE DE SÃO PAULO', 'FMUSP']
def is_usp(inst):
    if not inst: return False
    u = inst.upper()
    return any(k in u for k in usp_keys) and not any(x in u for x in ['RIBEIR', 'RP', 'HCRP'])

files = glob.glob('data/*_final_questions.json')
pending = []
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        if str(q.get('ano', q.get('year', ''))) == '2022' and is_usp(q.get('instituicao', q.get('institution', ''))):
            ans = q.get('correct_answer') or q.get('correctAnswer')
            if not ans and not q.get('is_anulada'):
                pending.append({
                    'file': fpath,
                    'id': q.get('id'),
                    'code': q.get('code'),
                    'statement': q.get('statement') or q.get('enunciado') or '',
                    'options': q.get('options')
                })

print(f"Total USP-SP 2022 pendentes sem resposta: {len(pending)}")
with open('data/official_exams/USP_FUVEST/usp_2022_pending.json', 'w', encoding='utf-8') as f:
    json.dump(pending, f, indent=2, ensure_ascii=False)

for p in pending:
    print(f"{p['file']} | {p['id']} | {p['code']} | {p['statement'][:70]}")
