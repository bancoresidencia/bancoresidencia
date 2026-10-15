import json, glob, sys, re
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

files = glob.glob('data/*_final_questions.json')
qs_2021 = []
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        if 'amrigs' in q.get('institution', '').lower() and q.get('year') == 2021:
            code = q.get('code', '')
            m = re.search(r'(\d+)$', code)
            num = int(m.group(1)) if m else 0
            qs_2021.append((num, code, q.get('correct_answer'), q.get('is_anulada'), q.get('statement', '')[:50]))

qs_2021.sort(key=lambda x: x[0])
print(f"Total 2021 questions: {len(qs_2021)}")
print(f"Min code num: {qs_2021[0][0]}, Max code num: {qs_2021[-1][0]}")

for num, code, ans, is_anul, stmt in qs_2021[:25]:
    print(f"  Num: {num} | Code: {code} | Ans: {ans} | Anul: {is_anul} | Stmt: {stmt}")
