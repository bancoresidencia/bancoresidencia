import json, glob, sys, re

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# The 80 official answers for IAMSPE 2021 Acesso Direto:
# Row 1 (1-20): C D X C A X B D D A B A D X C D E B C C
# Row 2 (21-40): E A E C A D E B C B B E C B B C C D E C
# Row 3 (41-60): A A X E B B D A B D C E B A D A A E A A
# Row 4 (61-80): E B E X A A D B C D E A C D E E B B D C

row1 = "C D X C A X B D D A B A D X C D E B C C".split()
row2 = "E A E C A D E B C B B E C B B C C D E C".split()
row3 = "A A X E B B D A B D C E B A D A A E A A".split()
row4 = "E B E X A A D B C D E A C D E E B B D C".split()

official_keys_80 = row1 + row2 + row3 + row4
print(f"Total official keys: {len(official_keys_80)}")

# Load IAMSPE 2021 questions from our specialty files
files = glob.glob('data/*_final_questions.json')
iamspe_2021_qs = []

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        inst = q.get('institution', '')
        yr = q.get('year', 0)
        if 'iamspe' in inst.lower() and yr == 2021:
            q['_file'] = f
            iamspe_2021_qs.append(q)

print(f"Total IAMSPE 2021 questions found in database: {len(iamspe_2021_qs)}")

# Check codes and current answers
with_ans = 0
without_ans = 0
for q in iamspe_2021_qs:
    ans = str(q.get('correct_answer') or q.get('correctAnswer') or q.get('answer') or '').strip().upper()
    is_anul = q.get('is_anulada') or q.get('isAnulada') or ('ANUL' in ans)
    if is_anul or ans in ['A', 'B', 'C', 'D', 'E']:
        with_ans += 1
    else:
        without_ans += 1

print(f"Com gabarito: {with_ans}, Sem gabarito: {without_ans}")

# Inspect codes:
print("\nPrimeiros 10 códigos:")
for q in iamspe_2021_qs[:10]:
    ans = str(q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper()
    print(f"  ID: {q.get('id')}, Code: {q.get('code')}, Ans: {ans}, Stmt: {q.get('statement')[:70]}...")
