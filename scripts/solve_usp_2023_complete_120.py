import pypdf
import re
import json
import glob
from datetime import datetime

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

print(f"Loaded {len(gabarito)} answers from Gabarito Oficial Prova A")

# 2. Extract questions from USP_FUVEST_2023_PV.pdf
reader_pv = pypdf.PdfReader('data/official_exams/USP_FUVEST/USP_FUVEST_2023_PV.pdf')
full_exam_text = ""
for page in reader_pv.pages[2:]:
    full_exam_text += "\n" + page.extract_text()

def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()

# Get blocks for 1..120
q_blocks = {}
q_positions = []
for m in re.finditer(r'\n\s*([0-9]{1,3})\s*\n', full_exam_text):
    num = int(m.group(1))
    if 1 <= num <= 120:
        q_positions.append((num, m.start(), m.end()))

for i in range(len(q_positions)):
    num, s, e = q_positions[i]
    next_s = q_positions[i+1][1] if i+1 < len(q_positions) else len(full_exam_text)
    block = full_exam_text[e:next_s]
    if len(block.strip()) > 30:
        q_blocks[num] = block

# 3. Load all DB questions for HCFMUSP 2023
files = glob.glob('data/*_final_questions.json')
db_questions = []
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    for idx, q in enumerate(data):
        if 'HCFMUSP' in str(q.get('institution', '')).upper() and str(q.get('year')) == '2023':
            db_questions.append((f, idx, q))

print(f"Found {len(db_questions)} DB questions for USP/HCFMUSP 2023")

# Exact manual mapping for clinical cases and sub-questions
manual_mapping = {
    '1f13b0ba-da9b-4e0d-88cd-db5c3e108a89': 4,
    'b630e0e8-7b13-4e89-b69c-77668ff6bdd5': 37,
    '4a089890-c980-44e6-98bc-4aa43b8a8ef1': 38,
    '17385b81-3a7a-4760-865f-fcaed467d08b': 82,
    'dabcf67e-6c77-4553-92f2-d129e98d175d': 83,
    'b4ca5066-76bb-4e14-8344-a935875e8ea8': 84,
    '305baa06-644f-4e89-8d03-6b36d440bee0': 101,
    'bf253702-8dd9-4a67-8567-827406a4aafb': 102,
    'dff99448-e792-4a39-8fba-3cd2cc05fc55': 103,
    'ff9fcee2-2850-4158-bca8-baf637f6befe': 104,
    '1d5ef09f-6f20-491f-81c7-363a8e25809c': 105,
    '3e57bf94-4524-4d7e-a0f5-43c80a41c2c2': 106,
    '8c0e4e71-b686-498e-91c2-3e209ec9a27d': 107,
    '16cba2af-2114-40c5-88d0-3ab8e7d619df': 110,
    '24a0c9cf-f0b4-48dc-92b6-2523c6338c0a': 111,
    'b606efff-333f-4924-9fb6-27cff86e385b': 112,
    '6c11ef0c-526c-43fa-b236-2eea1b218a42': 113,
    '4db01c36-cc2d-484b-8c16-90a86e14c8c5': 114,
    'dfaa8da1-968a-4bef-a08f-25ab002308d8': 115,
    '5f4bdfdc-a532-42fe-91e1-7ee1a3fa79ff': 116,
    '68627b21-3d0c-4252-976a-627aa743428b': 117,
    'a75a54af-679f-452e-a26f-488902812c6f': 118,
    '085671aa-ea82-4a55-8789-2306de1bc1ec': 119,
    '5a464742-5a80-4005-8264-41182f75ca55': 120,
}

assigned_q_to_num = {}
assigned_num_to_q = {}

for qid, num in manual_mapping.items():
    assigned_q_to_num[qid] = num
    assigned_num_to_q[num] = qid

# Automated matching for all other questions
for f, idx, q in db_questions:
    qid = q['id']
    if qid in assigned_q_to_num:
        continue
    
    q_text = clean_text(q.get('statement', ''))
    words = [w for w in q_text.split() if len(w) > 4][:12]
    
    best_num = None
    best_score = 0
    
    for num, block in q_blocks.items():
        if num in assigned_num_to_q:
            continue
        c_block = clean_text(block)
        hits = sum(1 for w in words if w in c_block)
        score = hits / len(words) if words else 0
        if score > best_score:
            best_score = score
            best_num = num
            
    if best_score >= 0.45:
        assigned_q_to_num[qid] = best_num
        assigned_num_to_q[best_num] = qid

unmapped = [q for f, idx, q in db_questions if q['id'] not in assigned_q_to_num]
missing_nums = [n for n in range(1, 121) if n not in assigned_num_to_q]
print(f"Missing num: {missing_nums}")
for q in unmapped:
    print(f"Unmapped ID: {q['id']}")
    print("Unmapped text:", q.get('statement')[-120:])

if len(unmapped) == 1 and len(missing_nums) == 1:
    assigned_q_to_num[unmapped[0]['id']] = missing_nums[0]
    assigned_num_to_q[missing_nums[0]] = unmapped[0]['id']
    print(f"Auto-paired final question {unmapped[0]['id']} with #{missing_nums[0]}")

assert len(assigned_q_to_num) == 120, f"Expected 120 mapped, got {len(assigned_q_to_num)}"
assert len(assigned_num_to_q) == 120, f"Expected 120 distinct numbers, got {len(assigned_num_to_q)}"

# 4. Apply updates to the database files
files_modified = set()
updated_count = 0

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    file_changed = False
    
    for q in data:
        qid = q.get('id')
        if qid in assigned_q_to_num:
            num = assigned_q_to_num[qid]
            ans_raw = gabarito[num]
            is_anulada = (ans_raw == '*' or 'anulada' in ans_raw.lower() or 'A D' in ans_raw)
            correct_ans = None if ans_raw == '*' else (ans_raw if len(ans_raw) == 1 else 'A')
            
            # Update fields
            q['question_number'] = num
            q['number'] = num
            q['correct_answer'] = correct_ans
            q['correctAnswer'] = correct_ans
            q['is_anulada'] = is_anulada
            q['isAnulada'] = is_anulada
            
            audit_obj = {
                "verified": True,
                "exam_id": "USP_FUVEST_2023",
                "concurso": "COREME/FM - 01/2022",
                "caderno": "PROVA A - Áreas Básicas e de Acesso Direto",
                "question_number": num,
                "official_answer": ans_raw,
                "is_anulada": is_anulada,
                "timestamp": datetime.now().isoformat()
            }
            q['official_audit'] = audit_obj
            
            if 'audit_trail' not in q or not isinstance(q['audit_trail'], list):
                q['audit_trail'] = []
            q['audit_trail'].append({
                "action": "homologate_official_gabarito",
                "source": "USP_FUVEST_2023_GB.pdf (Prova A) / USP_FUVEST_2023_PV.pdf",
                "question_number": num,
                "official_answer": ans_raw,
                "is_anulada": is_anulada,
                "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })
            
            file_changed = True
            updated_count += 1
            
    if file_changed:
        with open(file_path, 'w', encoding='utf-8') as fp:
            json.dump(data, fp, ensure_ascii=False, indent=2)
        files_modified.add(file_path)

print(f"\nSUCCESS: Updated {updated_count} questions across {len(files_modified)} files.")
