import json
import re
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/official_exams/SANTA_CASA_SP/sc_2020_matches.json', 'r', encoding='utf-8') as f:
    matches = json.load(f)

with open('data/official_exams/SANTA_CASA_SP/sc_2020_prova_extracted.txt', 'r', encoding='utf-8') as f:
    full_text = f.read()

# Let's inspect the questions in prova for 15, 16, 17
for qn in [15, 16, 17, 48, 49, 50, 94, 95, 96, 32, 33, 34]:
    m = re.search(r'QUEST[ÃA]O\s+' + str(qn) + r'\b(.*?)(?=QUEST[ÃA]O|\Z)', full_text, re.DOTALL)
    if m:
        cleaned = " ".join(m.group(1).split())[:120]
        print(f"PROVA Q{qn}: {cleaned}")

print("\n--- DB MATCHES WITH DUPLICATES ---")
for m in matches:
    if m['q_num'] in [15, 33, 48, 94]:
        print(f"ID {m['id']} mapped to Q{m['q_num']}: {m['snippet']}")
