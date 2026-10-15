import glob
import json
import re
import unicodedata
import pypdf

def normalize(text):
    if not text:
        return ""
    text = unicodedata.normalize('NFKD', text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    return " ".join(text.lower().split())

# Extract AMRIGS_2017_PROVA.pdf
reader = pypdf.PdfReader('data/official_exams/AMRIGS/AMRIGS_2017_PROVA.pdf')
prova_2017_text = ""
for i, page in enumerate(reader.pages):
    prova_2017_text += f"\n--- PAGE {i+1} ---\n" + (page.extract_text() or "")

# Split questions
q_splits = re.split(r'(QUEST[ÃA]O\s+(\d+))', prova_2017_text)
q_dict_2017 = {}
for i in range(1, len(q_splits), 3):
    q_num = int(q_splits[i+1])
    content = q_splits[i+2]
    q_dict_2017[q_num] = content

print(f"Extracted {len(q_dict_2017)} questions from AMRIGS_2017_PROVA.pdf: {sorted(q_dict_2017.keys())[:10]} ...")

# Check DB questions for AMRIGS 2017
amrigs_2017_db = []
for fpath in glob.glob('data/*_final_questions.json'):
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        if 'AMRIGS' in str(q.get('institution', '')).upper() and q.get('year') == 2017:
            amrigs_2017_db.append((fpath, q))

print(f"Found {len(amrigs_2017_db)} questions in DB for AMRIGS 2017.")

# Match against q_dict_2017
match_count = 0
for fpath, q in amrigs_2017_db:
    stmt = q.get('statement') or q.get('text') or ''
    norm_stmt = normalize(stmt)
    words = [w for w in re.findall(r'[a-z]+', norm_stmt) if len(w) >= 5]
    best_q = None
    best_score = 0
    for q_num, content in q_dict_2017.items():
        norm_content = normalize(content)
        score = sum(1 for w in words if w in norm_content)
        if score > best_score:
            best_score = score
            best_q = q_num
    ratio = best_score / max(1, len(words))
    if ratio >= 0.7:
        match_count += 1

print(f"Matched {match_count} / {len(amrigs_2017_db)} questions with ratio >= 0.7 against AMRIGS_2017_PROVA.pdf!")
