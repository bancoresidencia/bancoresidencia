import json, glob, re, sys, pypdf
from difflib import SequenceMatcher

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("="*80)
print("HOMOLOGAÇÃO OFICIAL: AMRIGS (CONCURSOS 438 E 476 - ANOS 2018 E 2019)")
print("="*80)

def norm(txt):
    return re.sub(r'[^a-z0-9]', '', str(txt).lower())

def extract_amrigs_exam(pdf_path):
    reader = pypdf.PdfReader(pdf_path)
    full_text = ''
    for p in reader.pages[2:]:
        full_text += p.extract_text() + '\n'
    
    # Fix separated digits in QUESTÃO X Y
    fixed_text = re.sub(r'QUEST[ÃA]O\s+(\d)\s+(\d)', r'QUESTÃO \1\2', full_text, flags=re.I)
    
    q_blocks = re.findall(r'QUEST[ÃA]O\s+(\d+)\s+[–-]\s+(.*?)(?=QUEST[ÃA]O\s+\d+\s+[–-]|\Z)', fixed_text, re.DOTALL | re.IGNORECASE)
    exam_questions = {}
    for qnum_str, qbody in q_blocks:
        qnum = int(qnum_str)
        lines = [l.strip() for l in qbody.split('\n') if l.strip()]
        cleaned = [l for l in lines if not any(k in l for k in ['_AD_', 'Fundatec', 'ACESSO DIRETO', 'RESIDÊNCIAS COM ACESSO'])]
        exam_questions[qnum] = ' '.join(cleaned)
    return exam_questions

# -------------------------------------------------------------
# 1. PARSE CONCURSO 438 (YEAR 2018 IN DB)
# -------------------------------------------------------------
exam_438 = extract_amrigs_exam('data/official_exams/AMRIGS/AMRIGS_2017_PROVA.pdf')
reader_gab_438 = pypdf.PdfReader('data/official_exams/AMRIGS/AMRIGS_2017_GABARITO.pdf')
gab_text_438 = reader_gab_438.pages[0].extract_text() + '\n' + reader_gab_438.pages[1].extract_text()
ans_438 = {int(num): ans for num, ans in re.findall(r'(\d+)\s+([A-E*])', gab_text_438)}
print(f"Concurso 438: {len(exam_438)} questões extraídas do caderno, {len(ans_438)} gabaritos oficiais")

# -------------------------------------------------------------
# 2. PARSE CONCURSO 476 (YEAR 2019 IN DB)
# -------------------------------------------------------------
exam_476 = extract_amrigs_exam('data/official_exams/AMRIGS/AMRIGS_2018_PROVA.pdf')
gabarito_str_476 = """
1:D 2:A 3:C 4:A 5:C 6:A 7:B 8:D 9:D 10:C
11:C 12:B 13:B 14:A 15:A 16:C 17:C 18:C 19:D 20:A
21:B 22:D 23:D 24:A 25:C 26:D 27:A 28:B 29:C 30:A
31:D 32:B 33:D 34:A 35:D 36:D 37:A 38:C 39:C 40:*
41:B 42:C 43:* 44:D 45:D 46:C 47:B 48:B 49:B 50:A
51:C 52:D 53:B 54:B 55:C 56:A 57:C 58:* 59:C 60:D
61:A 62:C 63:B 64:C 65:A 66:C 67:B 68:C 69:C 70:A
71:A 72:B 73:B 74:D 75:D 76:B 77:C 78:D 79:B 80:D
81:B 82:C 83:C 84:A 85:D 86:B 87:A 88:B 89:D 90:C
91:D 92:C 93:A 94:* 95:D 96:B 97:C 98:* 99:D 100:B
"""
ans_476 = {}
for pair in gabarito_str_476.split():
    if ':' in pair:
        num, ans = pair.split(':')
        ans_476[int(num)] = ans
print(f"Concurso 476: {len(exam_476)} questões extraídas do caderno, {len(ans_476)} gabaritos oficiais")

# -------------------------------------------------------------
# 3. CARREGAR BANCO LOCAL
# -------------------------------------------------------------
files = glob.glob('data/*_final_questions.json')
specialty_data = {}
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        specialty_data[f] = json.load(fp)

# Matcher function
def match_and_resolve(target_year, exam_dict, ans_dict, label):
    matched_count = 0
    anuladas_count = 0
    unmatched_pdf = set(exam_dict.keys())
    
    # Collect target DB questions
    candidates = []
    for fpath, qs in specialty_data.items():
        for q in qs:
            if 'AMRIGS' in (q.get('institution') or '') and q.get('year') == target_year:
                candidates.append((fpath, q))
                
    print(f"\n--- Processando {label} (Target Year {target_year}): {len(candidates)} questões no banco ---")
    
    for fpath, q in candidates:
        stmt = norm(q.get('statement', '')[:100])
        opts = norm(' '.join([opt.get('text', '')[:40] for opt in q.get('options', [])]))
        target = stmt + opts
        
        best_num = None
        best_score = 0.0
        
        for qnum in unmatched_pdf:
            pdf_txt = norm(exam_dict[qnum][:300])
            if len(stmt) > 25 and stmt[:40] in pdf_txt:
                best_num = qnum
                best_score = 1.0
                break
            ratio = SequenceMatcher(None, target[:150], pdf_txt[:150]).ratio()
            if ratio > best_score:
                best_score = ratio
                best_num = qnum
                
        if best_score > 0.55 and best_num in unmatched_pdf:
            unmatched_pdf.remove(best_num)
            official_ans = ans_dict.get(best_num)
            
            # Apply official homologation
            q['question_number'] = best_num
            q['is_official'] = True
            q['official_source'] = f"Gabarito Oficial Definitivo {label} (Fundatec/AMRIGS)"
            
            if official_ans == '*':
                q['is_anulada'] = True
                q['isAnulada'] = True
                q['correct_answer'] = 'ANULADA'
                q['correctAnswer'] = 'ANULADA'
                anuladas_count += 1
                q['official_audit'] = {
                    'concurso': label,
                    'question_number': best_num,
                    'status': 'ANULADA',
                    'match_score': round(best_score, 4)
                }
            else:
                q['is_anulada'] = False
                q['isAnulada'] = False
                q['correct_answer'] = official_ans
                q['correctAnswer'] = official_ans
                q['official_audit'] = {
                    'concurso': label,
                    'question_number': best_num,
                    'status': 'VALIDA',
                    'gabarito_oficial': official_ans,
                    'match_score': round(best_score, 4)
                }
            matched_count += 1
        else:
            print(f"  [PENDENTE/NÃO CASADA]: Score {best_score:.2f} com Q#{best_num} | {q.get('statement','')[:70]}")
            
    print(f"Resultados {label}: {matched_count} homologadas ({anuladas_count} anuladas, {matched_count - anuladas_count} válidas). Sobraram no PDF: {len(unmatched_pdf)}")

match_and_resolve(2018, exam_438, ans_438, "AMRIGS Concurso 438 (Edição 2018)")
match_and_resolve(2019, exam_476, ans_476, "AMRIGS Concurso 476 (Edição 2019)")

# Save updated files
total_saved = 0
for fpath, qs in specialty_data.items():
    with open(fpath, 'w', encoding='utf-8') as fp:
        json.dump(qs, fp, indent=2, ensure_ascii=False)
    total_saved += len(qs)

print(f"\n✅ Todos os arquivos data/*_final_questions.json salvos com sucesso!")
