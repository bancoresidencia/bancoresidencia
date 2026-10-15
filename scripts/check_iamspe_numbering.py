import json, glob, sys, re

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

files = glob.glob('data/*_final_questions.json')
iamspe_qs = []

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        if 'iamspe' in q.get('institution', '').lower() and q.get('year') == 2021:
            q['_file'] = f
            iamspe_qs.append(q)

def extract_num(code):
    m = re.search(r'-(\d+)$', str(code))
    return int(m.group(1)) if m else 0

iamspe_qs.sort(key=lambda q: extract_num(q.get('code', '')))

print(f"Total: {len(iamspe_qs)} questoes")
for i, q in enumerate(iamspe_qs):
    num = extract_num(q.get('code', ''))
    ans = str(q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper()
    is_anul = q.get('is_anulada') or q.get('isAnulada')
    print(f"[{i+1:>2}] Code: {q.get('code')} -> Num: {num} | Ans: {ans:<2} | Anul: {is_anul} | Stmt: {q.get('statement')[:60]}...")
