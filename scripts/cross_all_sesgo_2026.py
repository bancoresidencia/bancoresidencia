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
            'words': set(re.findall(r'\b[a-zA-ZáéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ]{4,}\b', stmt.lower()))
        }
    return questions

print("Loading SES-GO 2026 exams and gabaritos...")
exams_data = {}
gb_files = sorted([f for f in os.listdir(folder) if f.startswith('GB_') and f.endswith('.pdf')])
for gbf in gb_files:
    pvf = gbf.replace('GB_', 'PV_')
    pv_path = os.path.join(folder, pvf)
    gb_path = os.path.join(folder, gbf)
    if os.path.exists(pv_path):
        gabs = parse_verbena_gb(gb_path)
        qs = extract_verbena_questions(pv_path)
        exams_data[pvf] = {
            'gabs': gabs,
            'questions': qs,
            'gb_file': gbf
        }

print(f"Loaded {len(exams_data)} complete exam suites.")

with open('data/pending_sesgo_all.json', 'r', encoding='utf-8') as f:
    pendings = json.load(f)

p2026 = [q for q in pendings if q['year'] == 2026]
print(f"Pending questions to resolve: {len(p2026)}")

confirmed = []
unmatched = []

for q in p2026:
    q_stmt = clean_txt(q['statement'])
    q_words = set(re.findall(r'\b[a-zA-ZáéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ]{4,}\b', q_stmt.lower()))
    best_match = None
    
    for pvf, edata in exams_data.items():
        for num, exam_q in edata['questions'].items():
            common = len(q_words & exam_q['words'])
            if common < 4:
                continue
                
            ex_stmt = exam_q['statement']
            sim = similar(q_stmt[:120], ex_stmt[:120])
            if sim >= 0.75 or ex_stmt[:50].lower() in q_stmt.lower() or q_stmt[:50].lower() in ex_stmt.lower():
                ans_letter = edata['gabs'].get(num)
                if ans_letter:
                    best_match = {
                        'pv_file': pvf,
                        'gb_file': edata['gb_file'],
                        'q_num': num,
                        'ans_letter': ans_letter,
                        'sim': sim,
                        'exam_stmt': ex_stmt[:80]
                    }
                    break
        if best_match:
            break
            
    if best_match:
        confirmed.append({
            'id': q['id'],
            'code': q['code'],
            'institution': q['institution'],
            'year': q['year'],
            'correct_answer': best_match['ans_letter'] if best_match['ans_letter'] not in ('X', '*') else 'ANULADA',
            'official_key': best_match['ans_letter'],
            'pv_file': best_match['pv_file'],
            'q_num': best_match['q_num'],
            'stmt_snippet': q['statement'][:70]
        })
    else:
        unmatched.append(q)

print(f"\n================ RESULTADO SES-GO 2026 ================")
print(f"Total pendências: {len(p2026)}")
print(f"Casadas com gabarito oficial: {len(confirmed)} ({len(confirmed)/len(p2026)*100:.1f}%)")
print(f"Não casadas: {len(unmatched)}")

with open('data/ready_to_commit_sesgo_2026.json', 'w', encoding='utf-8') as f:
    json.dump(confirmed, f, indent=2, ensure_ascii=False)

print(f"Saved {len(confirmed)} confirmed items to data/ready_to_commit_sesgo_2026.json")
