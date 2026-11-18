import os
import pypdf
import json
import re
from difflib import SequenceMatcher

folder = 'data/incoming_exams/SES_GO_2026'

def clean_txt(t):
    return re.sub(r'\s+', ' ', t).strip()

def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()

# Parse gabaritos
def parse_verbena_gb(path):
    reader = pypdf.PdfReader(path)
    txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    lines = [l.strip() for l in txt.split('\n') if l.strip()]
    answers = {}
    current_nums = []
    for l in lines:
        tokens = l.split()
        if all(t.isdigit() for t in tokens) and len(tokens) >= 2:
            current_nums = [int(t) for t in tokens]
            continue
        if current_nums and len(tokens) == len(current_nums) and all(t in ('A', 'B', 'C', 'D', 'X', '*') for t in tokens):
            for num, ans in zip(current_nums, tokens):
                answers[num] = ans
            current_nums = []
    return answers

# Extract questions from PV
def extract_verbena_questions(path):
    reader = pypdf.PdfReader(path)
    txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    
    splits = list(re.finditer(r'QUESTÃO\s+(\d+)', txt, re.IGNORECASE))
    questions = {}
    for i, m in enumerate(splits):
        num = int(m.group(1))
        start = m.end()
        end = splits[i+1].start() if i+1 < len(splits) else len(txt)
        q_raw = txt[start:end].strip()
        
        opt_matches = list(re.finditer(r'\(([A-D])\)', q_raw))
        if opt_matches:
            stmt = clean_txt(q_raw[:opt_matches[0].start()])
            opts = {}
            for j, om in enumerate(opt_matches):
                letter = om.group(1)
                ostart = om.end()
                oend = opt_matches[j+1].start() if j+1 < len(opt_matches) else len(q_raw)
                opts[letter] = clean_txt(q_raw[ostart:oend])
        else:
            stmt = clean_txt(q_raw)
            opts = {}
            
        questions[num] = {
            'statement': stmt,
            'options': opts,
            'q_raw': clean_txt(q_raw)
        }
    return questions, clean_txt(txt)

# Load only Versao A exams and gabaritos (Versao A is canonical standard)
exams_data = {}
for f in sorted(os.listdir(folder)):
    if f.startswith('PV_') and 'VERSAO_A' in f and f.endswith('.pdf'):
        gbf = f.replace('PV_', 'GB_')
        pv_path = os.path.join(folder, f)
        gb_path = os.path.join(folder, gbf)
        if os.path.exists(gb_path):
            gabs = parse_verbena_gb(gb_path)
            qs, full_txt = extract_verbena_questions(pv_path)
            exams_data[f] = {
                'gabs': gabs,
                'questions': qs,
                'full_txt': full_txt,
                'gb_file': gbf
            }

print(f"Loaded {len(exams_data)} Versao A exams.")

# Load pending questions
with open('data/pending_sesgo_all.json', 'r', encoding='utf-8') as f:
    pendings = json.load(f)

p2026 = [q for q in pendings if q['year'] == 2026]
print(f"Total pendências SES-GO 2026: {len(p2026)}")

confirmed = []
unmatched = []

for q in p2026:
    q_stmt = clean_txt(q['statement'])
    # Options in Supabase: list of dicts [{'letter': 'A', 'text': '...'}, ...]
    q_opts = {}
    if isinstance(q.get('options'), list):
        for o in q['options']:
            if isinstance(o, dict) and 'letter' in o and 'text' in o:
                q_opts[o['letter']] = clean_txt(o['text'])
                
    best_hit = None
    
    for pvf, edata in exams_data.items():
        # First check: does the exam full text contain phrases from the question?
        # Let's extract words from q_stmt
        q_words = re.findall(r'\b[a-zA-ZáéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ]{5,}\b', q_stmt.lower())
        
        # Test each question in this exam
        for num, eq in edata['questions'].items():
            # Match condition 1: Options match!
            # If at least 2 options match identically or with > 85% similarity
            opt_matches = 0
            for l in ['A', 'B', 'C', 'D']:
                if l in q_opts and l in eq['options']:
                    if similar(q_opts[l].lower(), eq['options'][l].lower()) >= 0.85:
                        opt_matches += 1
                        
            # Match condition 2: Statement match
            stmt_match = False
            if similar(q_stmt.lower()[:80], eq['statement'].lower()[:80]) >= 0.70:
                stmt_match = True
            elif any(w in eq['statement'].lower() for w in q_words[:3]) and opt_matches >= 2:
                stmt_match = True
            elif opt_matches >= 3:
                stmt_match = True
                
            if stmt_match and opt_matches >= 2:
                ans_letter = edata['gabs'].get(num)
                if ans_letter:
                    best_hit = {
                        'pv_file': pvf,
                        'gb_file': edata['gb_file'],
                        'q_num': num,
                        'ans_letter': ans_letter,
                        'opt_matches': opt_matches,
                        'ex_stmt': eq['statement'][:60]
                    }
                    break
        if best_hit:
            break
            
    if best_hit:
        confirmed.append({
            'id': q['id'],
            'code': q['code'],
            'institution': q['institution'],
            'year': q['year'],
            'correct_answer': best_hit['ans_letter'] if best_hit['ans_letter'] not in ('X', '*') else 'ANULADA',
            'official_key': best_hit['ans_letter'],
            'pv_file': best_hit['pv_file'],
            'q_num': best_hit['q_num'],
            'opt_matches': best_hit['opt_matches'],
            'stmt_snippet': q['statement'][:70]
        })
    else:
        unmatched.append(q)

print(f"\n================ RESULTADO FINAL DUAL-GATE SES-GO 2026 ================")
print(f"Total pendências: {len(p2026)}")
print(f"Casadas com Dual-Gate (Enunciado + Opções): {len(confirmed)} ({len(confirmed)/len(p2026)*100:.1f}%)")
print(f"Não casadas: {len(unmatched)}")

with open('data/ready_to_commit_sesgo_2026.json', 'w', encoding='utf-8') as f:
    json.dump(confirmed, f, indent=2, ensure_ascii=False)

print(f"Saved {len(confirmed)} confirmed items to data/ready_to_commit_sesgo_2026.json")

if confirmed:
    print("\nPrimeiros 5 casamentos confirmados:")
    for c in confirmed[:5]:
        print(f"  {c['code']} -> {c['correct_answer']} (Prova: {c['pv_file']} Q{c['q_num']}, {c['opt_matches']}/4 opções casadas)")
