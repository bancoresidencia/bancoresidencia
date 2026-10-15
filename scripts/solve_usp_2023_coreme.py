import pypdf
import re
import json
import glob
from difflib import SequenceMatcher

def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()

def similarity(a, b):
    return SequenceMatcher(None, clean_text(a)[:150], clean_text(b)[:150]).ratio()

# 1. Parse official answers from page 1 of USP_FUVEST_2023_GB.pdf
reader_gb = pypdf.PdfReader('data/official_exams/USP_FUVEST/USP_FUVEST_2023_GB.pdf')
p1_text = reader_gb.pages[0].extract_text()

gabarito = {}
lines = p1_text.split('\n')
for line in lines:
    line = line.strip()
    m = re.match(r'^([0-9]{1,3})\s+([A-D\*]|\*|A\s+D)$', line)
    if m:
        num = int(m.group(1))
        ans = m.group(2).strip()
        gabarito[num] = ans

print(f"Parsed {len(gabarito)} answers from Gabarito Oficial Prova A")
print("Sample gabarito:", {k: gabarito[k] for k in sorted(gabarito.keys())[:10]})

# 2. Extract questions from USP_FUVEST_2023_PV.pdf
reader_pv = pypdf.PdfReader('data/official_exams/USP_FUVEST/USP_FUVEST_2023_PV.pdf')
full_exam_text = ""
for page in reader_pv.pages[2:]: # start from page 3 (index 2)
    full_exam_text += "\n" + page.extract_text()

# Split questions by number pattern
q_blocks = {}
# Look for questions formatted as \n01 \n or \n10 \n or \n100 \n
# Pattern: \n\s*([0-9]{2,3})\s*\n([A-ZÀ-Ú].+)
pattern = r'\n\s*([0-9]{1,3})\s*\n([^\n]+)'
matches = list(re.finditer(pattern, full_exam_text))
print(f"Found {len(matches)} potential question headers in exam PDF")

for idx, m in enumerate(matches):
    q_num = int(m.group(1))
    if 1 <= q_num <= 120:
        start_pos = m.start()
        end_pos = matches[idx+1].start() if idx+1 < len(matches) else len(full_exam_text)
        block = full_exam_text[start_pos:end_pos]
        # Keep the best/longest block if duplicate header
        if q_num not in q_blocks or len(block) > len(q_blocks[q_num]):
            q_blocks[q_num] = block

print(f"Extracted {len(q_blocks)} distinct questions from exam booklet (target: 120)")

# 3. Load USP 2023 questions from DB
files = glob.glob('data/*_final_questions.json')
db_questions = []
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    for q in data:
        if 'HCFMUSP' in str(q.get('institution', '')).upper() and str(q.get('year')) == '2023':
            db_questions.append((f, q))

print(f"Loaded {len(db_questions)} USP/HCFMUSP 2023 questions from DB")

# 4. Match DB questions to exam questions
matched = []
unmatched = []

for f, q in db_questions:
    q_text = q.get('statement', '')
    best_sim = 0
    best_num = None
    
    for num, block in q_blocks.items():
        # Remove header number from block
        block_clean = re.sub(r'^\s*[0-9]{1,3}\s*', '', block)
        sim = similarity(q_text, block_clean)
        if sim > best_sim:
            best_sim = sim
            best_num = num
            
    if best_sim >= 0.55: # strong match threshold
        ans = gabarito.get(best_num)
        matched.append((f, q, best_num, ans, best_sim))
    else:
        unmatched.append((f, q, best_sim, best_num))

print(f"\nMatching Results:")
print(f"Successfully Matched: {len(matched)} / {len(db_questions)}")
print(f"Unmatched: {len(unmatched)}")

if unmatched:
    print("\nSample unmatched:")
    for f, q, sim, num in unmatched[:5]:
        print(f"Sim {sim:.2f} (best #{num}): {q.get('statement', '')[:80]}...")
