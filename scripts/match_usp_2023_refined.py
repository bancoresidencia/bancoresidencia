import pypdf
import re
import json
import glob
from difflib import SequenceMatcher

def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()

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

# 2. Extract questions from USP_FUVEST_2023_PV.pdf
reader_pv = pypdf.PdfReader('data/official_exams/USP_FUVEST/USP_FUVEST_2023_PV.pdf')
full_exam_text = ""
for page in reader_pv.pages[2:]:
    full_exam_text += "\n" + page.extract_text()

# Map page texts and question numbers
# Let's inspect where questions 1 to 120 are in the PDF text
# Let's find each question number block
q_positions = []
for m in re.finditer(r'\n\s*([0-9]{1,3})\s*\n', full_exam_text):
    num = int(m.group(1))
    if 1 <= num <= 120:
        q_positions.append((num, m.start(), m.end()))

# Deduplicate to keep in-order 1..120
q_blocks = {}
for i in range(len(q_positions)):
    num, s, e = q_positions[i]
    # end is next question start or end of text
    next_s = q_positions[i+1][1] if i+1 < len(q_positions) else len(full_exam_text)
    block = full_exam_text[e:next_s]
    # Check if this block looks like a question (length > 40)
    if len(block.strip()) > 40:
        q_blocks[num] = block

# Also check for case vignettes that precede questions (e.g. CASO 1, CASO 2...)
# Let's load the 120 DB questions
files = glob.glob('data/*_final_questions.json')
db_questions = []
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    for q in data:
        if 'HCFMUSP' in str(q.get('institution', '')).upper() and str(q.get('year')) == '2023':
            db_questions.append((f, q))

print(f"Total q_blocks extracted: {len(q_blocks)}")
print(f"Missing q_numbers in blocks: {[n for n in range(1, 121) if n not in q_blocks]}")

# Match each DB question to q_blocks or full_exam_text
matched_db_to_num = {}
matched_num_to_db = {}

for num, block in sorted(q_blocks.items()):
    clean_block = clean_text(block)
    best_sim = 0
    best_q = None
    best_f = None
    
    for f, q in db_questions:
        if q['id'] in matched_db_to_num:
            continue
        q_text = clean_text(q.get('statement', ''))
        
        # Check direct substring
        words = [w for w in q_text.split() if len(w) > 4][:10]
        hits = sum(1 for w in words if w in clean_block)
        
        sim = hits / len(words) if words else 0
        if sim > best_sim:
            best_sim = sim
            best_q = q
            best_f = f
            
    if best_sim >= 0.6:
        matched_db_to_num[best_q['id']] = (num, best_f, best_q, best_sim)
        matched_num_to_db[num] = best_q['id']

print(f"Phase 1 keyword matching: {len(matched_db_to_num)} / {len(db_questions)}")

# Phase 2: for remaining unmatched, find which numbers are missing
missing_nums = [n for n in range(1, 121) if n not in matched_num_to_db]
unmatched_db = [(f, q) for f, q in db_questions if q['id'] not in matched_db_to_num]

print(f"Missing numbers ({len(missing_nums)}): {missing_nums}")
print(f"Unmatched DB questions ({len(unmatched_db)}):")
for f, q in unmatched_db:
    print(f"- ID: {q['id']} | {clean_text(q.get('statement', ''))[:100]}")
