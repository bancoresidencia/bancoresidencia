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
    q_text = parts[i+1].strip()
    # clean up text
    clean_text = ' '.join(q_text.split())
    # remove alternative labels like (A), (B), etc. for statement comparison
    clean_stmt = re.split(r'\([A-E]\)', clean_text)[0].strip()
    official_questions[q_num] = {
        'num': q_num,
        'key': official_keys[q_num-1],
        'full_text': clean_text,
        'stmt': clean_stmt
    }

def normalize(txt):
    return re.sub(r'[^a-zA-Z0-9]', '', txt.lower())

# 2. Load database IAMSPE 2021 questions
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
print(f"Total questoes na prova oficial: {len(official_questions)}")

# Match each DB question to an official question
matched = 0
unmatched = []
matched_map = {} # db_id -> (q_num, key, reason)

for q in db_questions:
    q_id = q['id']
    q_stmt = q.get('statement', '')
    q_norm = normalize(q_stmt[:120])
    
    best_num = None
    best_sim = 0.0
    
    for q_num, off in official_questions.items():
        off_norm = normalize(off['stmt'][:120])
        if q_norm and off_norm:
            # direct substring
            if q_norm[:50] in off_norm or off_norm[:50] in q_norm:
                best_num = q_num
                best_sim = 1.0
                break
            sim = SequenceMatcher(None, q_norm[:80], off_norm[:80]).ratio()
            if sim > best_sim:
                best_sim = sim
                best_num = q_num
                
    if best_sim > 0.65:
        off = official_questions[best_num]
        matched_map[q_id] = (best_num, off['key'], off['stmt'][:60])
        matched += 1
    else:
        unmatched.append((q, best_num, best_sim))

print(f"\nResultado do Matching: {matched}/{len(db_questions)} questoes casadas com sucesso!")
if unmatched:
    print(f"Nao casadas: {len(unmatched)}")
    for u, b_num, sim in unmatched:
        print(f"  ID: {u['id']} | Sim: {sim:.2f} | Stmt: {u.get('statement')[:70]}")

# Check for duplicate assignments
assigned_nums = [v[0] for v in matched_map.values()]
print(f"Numeros unicos atribuidos da prova: {len(set(assigned_nums))}/80")

# Compare with existing answers:
concordancias = 0
discordancias = 0
novas_respostas = 0
anulacoes = 0

for q in db_questions:
    q_id = q['id']
    if q_id in matched_map:
        q_num, off_key, off_stmt = matched_map[q_id]
        curr_ans = str(q.get('correct_answer') or q.get('correctAnswer') or '').strip().upper()
        curr_anul = bool(q.get('is_anulada') or q.get('isAnulada') or ('ANUL' in curr_ans))
        
        if off_key == 'X':
            anulacoes += 1
        elif curr_ans in ['A', 'B', 'C', 'D', 'E']:
            if curr_ans == off_key:
                concordancias += 1
            else:
                discordancias += 1
                print(f"  [DISCORDANCIA] Q{q_num}: Banco diz {curr_ans}, Prova oficial diz {off_key} (ID: {q_id})")
        else:
            novas_respostas += 1

print(f"\nEstatisticas de Validacao:")
print(f"  • Concordancias perfeitas com banco atual: {concordancias}")
print(f"  • Novas respostas a serem preenchidas: {novas_respostas}")
print(f"  • Questoes anuladas pela banca oficial (X): {anulacoes}")
print(f"  • Discordancias encontradas: {discordancias}")
