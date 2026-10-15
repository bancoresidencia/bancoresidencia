import json, glob, re

# Official answers extracted from AMRIGS_2020_concurso_594.pdf:
# 1-20: D B C * A D D A A C A B C D D C D D * *
# 21-40: C A D B B C C D D D * B C C B A B A * A
# 41-60: C B D B D D A C * C A C * C * A * D A B
# 61-80: B B B A C A B D C C A C C C * B D B A A
# 81-100: B D D D D D * A B B D * A A A D C D C B

raw_2020 = """
D B C * A D D A A C A B C D D C D D * *
C A D B B C C D D D * B C C B A B A * A
C B D B D D A C * C A C * C * A * D A B
B B B A C A B D C C A C C C * B D B A A
B D D D D D * A B B D * A A A D C D C B
"""

# Official answers extracted from AMRIGS_2021_concurso_647.pdf:
# 1-20: C C D A C D A D C B D C B A B D C A D B
# 21-40: C B D B B C B C C D B C D C D C D C B D
# 41-60: D D D D C A D A D D B B A C A A C D C A
# 61-80: A B C A C D D A C C C A B D A A C D B D
# 81-100: B B C D A B A B A D A B A B C A C D B D

raw_2021 = """
C C D A C D A D C B D C B A B D C A D B
C B D B B C B C C D B C D C D C D C B D
D D D D C A D A D D B B A C A A C D C A
A B C A C D D A C C C A B D A A C D B D
B B C D A B A B A D A B A B C A C D B D
"""

keys_2020 = {i+1: ans for i, ans in enumerate(raw_2020.split())}
keys_2021 = {i+1: ans for i, ans in enumerate(raw_2021.split())}

print(f"Keys 2020 parsed: {len(keys_2020)}")
print(f"Keys 2021 parsed: {len(keys_2021)}")

# Now check questions in our database files
files = glob.glob('data/*_final_questions.json')
for yr, keys in [(2020, keys_2020), (2021, keys_2021)]:
    print(f"\n================ YEAR {yr} ================")
    db_qs = []
    for f in files:
        with open(f, 'r', encoding='utf-8') as fp:
            qs = json.load(fp)
        for q in qs:
            if 'amrigs' in q.get('institution', '').lower() and q.get('year') == yr:
                db_qs.append((f, q))
    print(f"Total questions in DB for {yr}: {len(db_qs)}")
    
    # Check existing answers
    has_ans = 0
    matches = 0
    mismatches = 0
    no_ans = 0
    
    for f, q in db_qs:
        ans = str(q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper()
        # Does the question tell us its number?
        code = q.get('code', '')
        # Let's see if number can be inferred or if questions already have answers
        if ans:
            has_ans += 1
        else:
            no_ans += 1
    print(f"Existing answers: {has_ans}, Missing: {no_ans}")
