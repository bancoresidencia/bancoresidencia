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

# 1. Carregar Gabaritos Oficiais Definitivos de SES-DF
gabaritos_ses_df = {}

# 2024
with open('data/official_exams/SES_DF/ses_df_2024_gabarito.json', 'r', encoding='utf-8') as f:
    gb_2024 = json.load(f)['tipo_a']
    gabaritos_ses_df[2024] = {int(k): v for k, v in gb_2024.items()}

# 2025
with open('data/official_exams/SES_DF/ses_df_2025_gabarito.json', 'r', encoding='utf-8') as f:
    gb_2025 = json.load(f)['tipo_a']
    gabaritos_ses_df[2025] = {int(k): v for k, v in gb_2025.items()}

# 2026
with open('data/official_exams/SES_DF/ses_df_2026_gabarito.json', 'r', encoding='utf-8') as f:
    gb_2026 = json.load(f)['tipo_a']
    gabaritos_ses_df[2026] = {int(k): v for k, v in gb_2026.items()}

def parse_ses_df_pdf(pdf_path):
    if not os.path.exists(pdf_path):
        return {}
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"
    
    # Padrão: "QUESTÃO 1", "QUESTÃO 01", "QUESTÃO\n1", etc.
    pattern = r'QUEST[AÃÃOo\s]+(\d+)'
    splits = list(re.finditer(pattern, full_text, re.IGNORECASE))
    
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

print("--- Parseando cadernos oficiais SES-DF ---")
exams_ses_df = {
    2024: parse_ses_df_pdf('data/official_exams/SES_DF/SES_DF_2024_PV_TIPO_A.pdf'),
    2025: parse_ses_df_pdf('data/official_exams/SES_DF/SES_DF_2025_PV_TIPO_A.pdf'),
    2026: parse_ses_df_pdf('data/official_exams/SES_DF/SES_DF_2026_PV_TIPO_A.pdf'),
}

for y, qdict in exams_ses_df.items():
    print(f"SES-DF {y}: {len(qdict)} questões extraídas do caderno oficial Tipo A")

# 2. Matching e Atualização nas Questões Locais
files = glob.glob('data/*_final_questions.json')
total_updated = 0
matches_by_year = {2024: 0, 2025: 0, 2026: 0}

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as fp:
        questions = json.load(fp)
    
    modified = False
    for q in questions:
        is_ses_df = ('SES-DF' in q.get('institution', '') or 'SES-DF' in q.get('banca', '') or 'SESDF' in q.get('code', ''))
        y = q.get('year')
        
        ca = q.get('correct_answer')
        cA = q.get('correctAnswer')
        
        # Sincronizar simetria camelCase e snake_case se um deles já existir
        if ca and not cA:
            q['correctAnswer'] = ca
            modified = True
        elif cA and not ca:
            q['correct_answer'] = cA
            modified = True
            
        if is_ses_df and y in exams_ses_df and (not q.get('correct_answer') or not q.get('correctAnswer')):
            st_q = clean_text(q.get('statement', ''))
            opts = [clean_text(opt.get('text', '')) for opt in q.get('options', []) if opt.get('text')]
            
            exam_q = exams_ses_df[y]
            best_q_num = None
            best_score = 0
            
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
            
            if best_q_num and best_q_num in gabaritos_ses_df.get(y, {}):
                correct_letter = gabaritos_ses_df[y][best_q_num]
                q['correct_answer'] = correct_letter
                q['correctAnswer'] = correct_letter
                if correct_letter == '#':
                    q['is_anulada'] = True
                    q['isAnulada'] = True
                    
                q['commentary'] = f"Gabarito Oficial Definitivo Homologado - IADES SES-DF {y} Questão {best_q_num} (Prova Tipo A). Correspondência oficial."
                q['official_audit'] = {
                    'verified': True,
                    'source': 'official_exam_pdf',
                    'exam_id': f'SES_DF_{y}',
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
print(f"TOTAL DE QUESTÕES SES-DF ATUALIZADAS: {total_updated}")
for y, c in matches_by_year.items():
    print(f"  -> Ano {y}: {c} questões resolvidas")
print("=" * 60)
