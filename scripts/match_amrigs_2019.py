import json, glob, re, sys, pypdf
from difflib import SequenceMatcher

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("="*80)
print("EXTRAÇÃO E MATCHING EXATO: AMRIGS 2019")
print("="*80)

# 1. Read PDF
reader = pypdf.PdfReader('data/official_exams/AMRIGS/AMRIGS_2019_PROVA.pdf')
full_text = ''
for p in reader.pages[2:]: # skip cover / instructions
    full_text += p.extract_text() + '\n'

# 2. Extract questions 1 to 100
q_blocks = re.findall(r'QUEST[ÃA]O\s+(\d+)\s+[–-]\s+(.*?)(?=QUEST[ÃA]O\s+\d+\s+[–-]|\Z)', full_text, re.DOTALL | re.IGNORECASE)
print(f"Total blocos de questões extraídos do PDF: {len(q_blocks)}")

exam_questions = {}
for qnum_str, qbody in q_blocks:
    qnum = int(qnum_str)
    # clean header lines like '525_AD_1/11/201914:51:47' or 'ACESSO DIRETO E AUTOAVALIAÇÃO'
    lines = [l.strip() for l in qbody.split('\n') if l.strip()]
    cleaned_lines = []
    for l in lines:
        if '525_AD_' in l or 'Fundatec' in l or 'ACESSO DIRETO' in l:
            continue
        cleaned_lines.append(l)
    exam_questions[qnum] = ' '.join(cleaned_lines)

print(f"Questões no dicionário oficial: {len(exam_questions)} (min={min(exam_questions.keys())}, max={max(exam_questions.keys())})")

# 3. Read official answer key
# 1:* 2:C 3:A 4:C 5:B 6:C 7:C 8:C 9:B 10:D
# 11:B 12:A 13:B 14:B 15:C 16:B 17:B 18:B 19:* 20:C
# 21:B 22:D 23:C 24:B 25:A 26:B 27:A 28:C 29:D 30:A
# 31:A 32:A 33:C 34:C 35:D 36:A 37:C 38:D 39:A 40:D
# 41:D 42:* 43:B 44:A 45:C 46:D 47:C 48:C 49:D 50:B
# 51:C 52:C 53:D 54:C 55:C 56:B 57:D 58:D 59:D 60:C
# 61:D 62:A 63:B 64:B 65:D 66:C 67:D 68:C 69:A 70:B
# 71:D 72:B 73:B 74:A 75:A 76:C 77:B 78:C 79:A 80:D
# 81:B 82:C 83:D 84:D 85:A 86:C 87:A 88:D 89:C 90:B
# 91:D 92:D 93:A 94:A 95:D 96:B 97:B 98:D 99:C 100:*

gabarito_str = """
1:* 2:C 3:A 4:C 5:B 6:C 7:C 8:C 9:B 10:D
11:B 12:A 13:B 14:B 15:C 16:B 17:B 18:B 19:* 20:C
21:B 22:D 23:C 24:B 25:A 26:B 27:A 28:C 29:D 30:A
31:A 32:A 33:C 34:C 35:D 36:A 37:C 38:D 39:A 40:D
41:D 42:* 43:B 44:A 45:C 46:D 47:C 48:C 49:D 50:B
51:C 52:C 53:D 54:C 55:C 56:B 57:D 58:D 59:D 60:C
61:D 62:A 63:B 64:B 65:D 66:C 67:D 68:C 69:A 70:B
71:D 72:B 73:B 74:A 75:A 76:C 77:B 78:C 79:A 80:D
81:B 82:C 83:D 84:D 85:A 86:C 87:A 88:D 89:C 90:B
91:D 92:D 93:A 94:A 95:D 96:B 97:B 98:D 99:C 100:*
"""
official_answers = {}
for pair in gabarito_str.split():
    if ':' in pair:
        num, ans = pair.split(':')
        official_answers[int(num)] = ans

# 4. Load database questions for AMRIGS 2019
db_questions = []
for f in glob.glob('data/*_final_questions.json'):
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        if 'AMRIGS' in (q.get('institution') or '') and q.get('year') == 2019:
            db_questions.append((f, q))

print(f"Total questões cadastradas no banco para AMRIGS 2019: {len(db_questions)}")

def normalize(text):
    return re.sub(r'[^a-z0-9]', '', str(text).lower())

# 5. Perform bipartite matching
matches = []
unmatched_db = []
unmatched_pdf = set(exam_questions.keys())

for fpath, q in db_questions:
    stmt = q.get('statement', '')
    opts = ' '.join([opt.get('text', '') for opt in q.get('options', [])])
    db_full = normalize(stmt[:100] + ' ' + opts[:100])
    
    best_qnum = None
    best_score = 0.0
    
    for qnum in unmatched_pdf:
        pdf_txt = normalize(exam_questions[qnum][:300])
        # fast containment or ratio
        if len(db_full) > 20 and db_full[:40] in pdf_txt:
            best_qnum = qnum
            best_score = 1.0
            break
        ratio = SequenceMatcher(None, db_full[:120], pdf_txt[:120]).ratio()
        if ratio > best_score:
            best_score = ratio
            best_qnum = qnum
            
    if best_score > 0.65 and best_qnum in unmatched_pdf:
        unmatched_pdf.remove(best_qnum)
        ans = official_answers.get(best_qnum)
        matches.append((fpath, q, best_qnum, ans, best_score))
    else:
        unmatched_db.append((fpath, q, best_score, best_qnum))

print(f"\nResultado da Rodada 1 de matching:")
print(f"  Casadas com alta confiança: {len(matches)} / 100")
print(f"  Não casadas DB: {len(unmatched_db)}")
print(f"  Não casadas PDF: {len(unmatched_pdf)}")

if unmatched_db:
    print("\nExemplo não casada DB:")
    for fpath, q, sc, bq in unmatched_db[:3]:
        print(f"  Score {sc:.2f} com Q#{bq}: {q.get('statement', '')[:100]}")
        if bq:
            print(f"  PDF Q#{bq}: {exam_questions.get(bq, '')[:100]}")
