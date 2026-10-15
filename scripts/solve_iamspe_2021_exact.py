import json, glob, re, sys
from difflib import SequenceMatcher

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# 1. Load official exam text & keys
import pypdf
pdf_path = 'data/official_exams/IAMSPE/QUADRIX_001_IAMSPE-RM-2021_Prova_Objetiva_ACESSO DIRETO-AREAS BASICAS.pdf'
reader = pypdf.PdfReader(pdf_path)
full_text = ""
for page in reader.pages:
    full_text += page.extract_text() + "\n"

row1 = "C D X C A X B D D A B A D X C D E B C C".split()
row2 = "E A E C A D E B C B B E C B B C C D E C".split()
row3 = "A A X E B B D A B D C E B A D A A E A A".split()
row4 = "E B E X A A D B C D E A C D E E B B D C".split()
official_keys = row1 + row2 + row3 + row4

parts = re.split(r'\bQUEST[ÃA]O\s+(\d+)\b', full_text, flags=re.I)
official_questions = {}
for i in range(1, len(parts), 2):
    q_num = int(parts[i])
    q_raw = parts[i+1].strip()
    
    # Extract statement and alternatives from raw text
    # Pattern for alternatives (A) ... (B) ... (C) ... (D) ... (E) ...
    alt_matches = list(re.finditer(r'\(([A-E])\)\s*', q_raw))
    if alt_matches:
        stmt_text = q_raw[:alt_matches[0].start()].strip()
        alts = {}
        for idx, m in enumerate(alt_matches):
            letter = m.group(1)
            start_pos = m.end()
            end_pos = alt_matches[idx+1].start() if idx+1 < len(alt_matches) else len(q_raw)
            alts[letter] = q_raw[start_pos:end_pos].strip()
    else:
        stmt_text = q_raw
        alts = {}
        
    official_questions[q_num] = {
        'num': q_num,
        'key': official_keys[q_num-1],
        'stmt': stmt_text,
        'alts': alts,
        'full_raw': q_raw
    }

def norm(t):
    return re.sub(r'\s+', ' ', re.sub(r'[^a-zA-Z0-9áéíóúãõçÁÉÍÓÚÃÕÇ]', '', str(t)).lower())

# 2. Load DB questions
files = sorted(glob.glob('data/*_final_questions.json'))
db_questions = []

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        inst = q.get('institution', '')
        yr = q.get('year', 0)
        if 'iamspe' in inst.lower() and yr == 2021:
            q['_file'] = f
            db_questions.append(q)

print(f"Total questoes no banco: {len(db_questions)}")
print(f"Total questoes no PDF oficial: {len(official_questions)}")

# Match scoring
matched_pairs = [] # (score, q_id, q_num)
used_qnums = set()
used_dbids = set()

# Calculate pairwise similarity matrix
candidates = []
for q in db_questions:
    q_id = q['id']
    q_stmt_norm = norm(q.get('statement', '')[:200])
    # Also get alternative A norm
    q_alts = {opt.get('letter'): norm(opt.get('text', '')[:100]) for opt in q.get('options', [])}
    
    for q_num, off in official_questions.items():
        off_stmt_norm = norm(off['stmt'][:200])
        # Compare statement similarity
        if not q_stmt_norm or not off_stmt_norm:
            continue
            
        score = 0.0
        # If statements share prefix
        if q_stmt_norm[:60] == off_stmt_norm[:60]:
            score += 0.7
        else:
            sim_stmt = SequenceMatcher(None, q_stmt_norm[:100], off_stmt_norm[:100]).ratio()
            score += sim_stmt * 0.7
            
        # Compare alternative A or B
        off_alts = {k: norm(v[:100]) for k, v in off['alts'].items()}
        alt_matches = 0
        for ltr in ['A', 'B', 'C', 'D', 'E']:
            if ltr in q_alts and ltr in off_alts:
                if q_alts[ltr][:40] and off_alts[ltr][:40] and (q_alts[ltr][:40] == off_alts[ltr][:40]):
                    alt_matches += 1
        score += (alt_matches / 5.0) * 0.3
        
        candidates.append((score, q_id, q_num, q, off))

# Greedy bipartite matching by highest score
candidates.sort(key=lambda x: x[0], reverse=True)

final_match = {} # q_id -> (q_num, off_key, score, q, off)
for score, q_id, q_num, q, off in candidates:
    if q_id not in final_match and q_num not in used_qnums:
        if score > 0.45:
            final_match[q_id] = (q_num, off['key'], score, q, off)
            used_qnums.add(q_num)
            used_dbids.add(q_id)

print(f"\nFinal Matched: {len(final_match)}/80 questoes!")
print(f"Numeros unicos casados: {len(used_qnums)}/80")

if len(final_match) < len(db_questions):
    unmatched_db = [q for q in db_questions if q['id'] not in final_match]
    print(f"Faltam {len(unmatched_db)} questoes do banco:")
    for u in unmatched_db:
        print(f"  DB ID: {u['id']}, Code: {u.get('code')}, Stmt: {u.get('statement')[:70]}")
    missing_qnums = [n for n in range(1, 81) if n not in used_qnums]
    print(f"Numeros oficiais faltantes: {missing_qnums}")

# Print sample of matches
for q_id, (q_num, key, score, q, off) in sorted(final_match.items(), key=lambda x: x[1][0])[:15]:
    ans = str(q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper()
    print(f"Q{q_num:>2} (Score {score:.2f}) -> Oficial: {key:<2} | Banco atual: {ans:<2} | Code: {q.get('code')}")
