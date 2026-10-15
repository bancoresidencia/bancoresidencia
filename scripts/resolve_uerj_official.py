import fitz
import glob
import json
import os
import re
from difflib import SequenceMatcher

def clean_text(text):
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()

def parse_uerj_gabarito(pdf_path):
    if not os.path.exists(pdf_path):
        return {}
    doc = fitz.open(pdf_path)
    text = doc[0].get_text()
    tokens = text.split()
    
    gabarito = {}
    curr_r_batch = []
    i = 0
    while i < len(tokens):
        t = tokens[i]
        if re.match(r'^R\d+$', t):
            curr_r_batch.append(int(t[1:]))
            i += 1
        elif curr_r_batch:
            for r_num in curr_r_batch:
                if i < len(tokens):
                    ans = tokens[i].upper()
                    if ans in ['A', 'B', 'C', 'D', 'E', 'X']:
                        gabarito[r_num] = ans
                    i += 1
            curr_r_batch = []
        else:
            i += 1
    return gabarito

def parse_uerj_exam_pdf(pdf_path):
    if not os.path.exists(pdf_path):
        return {}
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"
        
    pattern = r'(?:^|\n)\s*(\d{1,3})\)\s+'
    splits = list(re.finditer(pattern, full_text))
    
    parsed = {}
    for i, match in enumerate(splits):
        try:
            q_num = int(match.group(1))
        except:
            continue
        start_idx = match.end()
        end_idx = splits[i+1].start() if i + 1 < len(splits) else len(full_text)
        q_body = clean_text(full_text[start_idx:end_idx])
        parsed[q_num] = q_body
    return parsed

print("--- Carregando Gabaritos e Provas da UERJ (2022 a 2026) ---")
uerj_data = {}
for y in [2022, 2023, 2024, 2025, 2026]:
    gb = parse_uerj_gabarito(f'data/official_exams/UERJ/UERJ_{y}_GB_DEF.pdf')
    pv = parse_uerj_exam_pdf(f'data/official_exams/UERJ/UERJ_{y}_PV_AD.pdf')
    uerj_data[y] = {'gabarito': gb, 'prova': pv}
    print(f"UERJ {y}: {len(gb)} respostas no gabarito, {len(pv)} questões no caderno oficial")

files = glob.glob('data/*_final_questions.json')
total_updated = 0
matches_by_year = {2022: 0, 2023: 0, 2024: 0, 2025: 0, 2026: 0}

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as fp:
        questions = json.load(fp)
    
    modified = False
    for q in questions:
        inst = q.get('institution', '') or q.get('banca', '') or ''
        is_uerj = 'UERJ' in inst or 'UERJ' in q.get('code', '')
        y = q.get('year')
        
        ca = q.get('correct_answer')
        cA = q.get('correctAnswer')
        
        if ca and not cA:
            q['correctAnswer'] = ca
            modified = True
        elif cA and not ca:
            q['correct_answer'] = cA
            modified = True
            
        if is_uerj and y in uerj_data and (not q.get('correct_answer') or not q.get('correctAnswer')):
            st_q = clean_text(q.get('statement', ''))
            opts = [clean_text(opt.get('text', '')) for opt in q.get('options', []) if opt.get('text')]
            
            exam_q = uerj_data[y]['prova']
            gb = uerj_data[y]['gabarito']
            
            best_q_num = None
            best_score = 0
            
            # 1. Busca por matching textual preciso do enunciado e opções
            for q_num, text_exam in exam_q.items():
                hit = False
                if len(st_q) >= 40 and st_q[:50].lower() in text_exam.lower():
                    hit = True
                elif len(st_q) >= 80 and st_q[30:80].lower() in text_exam.lower():
                    hit = True
                else:
                    opt_hits = sum(1 for o in opts if len(o) > 15 and o[:30].lower() in text_exam.lower())
                    if opt_hits >= 2:
                        hit = True
                        
                if hit:
                    best_q_num = q_num
                    best_score = 1.0
                    break
                else:
                    score = similar(st_q[:80].lower(), text_exam[:120].lower())
                    if score > best_score and score >= 0.70:
                        best_score = score
                        best_q_num = q_num
            
            if best_q_num and best_q_num in gb:
                correct_letter = gb[best_q_num]
                q['correct_answer'] = correct_letter
                q['correctAnswer'] = correct_letter
                if correct_letter == 'X':
                    q['is_anulada'] = True
                    q['isAnulada'] = True
                    
                q['commentary'] = f"Gabarito Oficial Definitivo Homologado - Residência Médica UERJ {y} Questão {best_q_num}. Correspondência com caderno oficial Acesso Direto."
                q['official_audit'] = {
                    'verified': True,
                    'source': 'official_exam_pdf',
                    'exam_id': f'UERJ_{y}',
                    'question_number': best_q_num,
                    'answer': correct_letter
                }
                modified = True
                total_updated += 1
                matches_by_year[y] = matches_by_year.get(y, 0) + 1
    
    if modified:
        with open(fpath, 'w', encoding='utf-8') as fp:
            json.dump(questions, fp, ensure_ascii=False, indent=2)
        print(f"Salvo {os.path.basename(fpath)}")

print("=" * 60)
print(f"TOTAL DE QUESTÕES UERJ ATUALIZADAS: {total_updated}")
for y, c in matches_by_year.items():
    print(f"  -> Ano {y}: {c} questões resolvidas")
print("=" * 60)
