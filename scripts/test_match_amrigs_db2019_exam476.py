import json, glob, re, sys, pypdf
from difflib import SequenceMatcher

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("="*80)
print("TESTANDO MATCHING: AMRIGS DB 2019 COM PROVA/GABARITO CID 476")
print("="*80)

# 1. Read PDF 476
reader = pypdf.PdfReader('data/official_exams/AMRIGS/AMRIGS_2018_PROVA.pdf')
full_text = ''
for p in reader.pages[2:]: # skip instructions
    full_text += p.extract_text() + '\n'

q_blocks = re.findall(r'QUEST[ÃA]O\s+(\d+)\s+[–-]\s+(.*?)(?=QUEST[ÃA]O\s+\d+\s+[–-]|\Z)', full_text, re.DOTALL | re.IGNORECASE)
exam_questions = {}
for qnum_str, qbody in q_blocks:
    qnum = int(qnum_str)
    lines = [l.strip() for l in qbody.split('\n') if l.strip()]
    cleaned = [l for l in lines if '476_AD_' not in l and 'Fundatec' not in l and 'ACESSO DIRETO' not in l]
    exam_questions[qnum] = ' '.join(cleaned)

print(f"Total questões no caderno oficial 476: {len(exam_questions)}")

# 2. Gabarito oficial 476
# 1:D 2:A 3:C 4:A 5:C 6:A 7:B 8:D 9:D 10:C
# 11:C 12:B 13:B 14:A 15:A 16:C 17:C 18:C 19:D 20:A
# 21:B 22:D 23:D 24:A 25:C 26:D 27:A 28:B 29:C 30:A
# 31:D 32:B 33:D 34:A 35:D 36:D 37:A 38:C 39:C 40:*
# 41:B 42:C 43:* 44:D 45:D 46:C 47:B 48:B 49:B 50:A
# 51:C 52:D 53:B 54:B 55:C 56:A 57:C 58:* 59:C 60:D
# 61:A 62:C 63:B 64:C 65:A 66:C 67:B 68:C 69:C 70:A
# 71:A 72:B 73:B 74:D 75:D 76:B 77:C 78:D 79:B 80:D
# 81:B 82:C 83:C 84:A 85:D 86:B 87:A 88:B 89:D 90:C
# 91:D 92:C 93:A 94:* 95:D 96:B 97:C 98:* 99:D 100:B

gabarito_str = """
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
official_answers = {}
for pair in gabarito_str.split():
    if ':' in pair:
        num, ans = pair.split(':')
        official_answers[int(num)] = ans

# 3. Load DB questions
db_questions = []
for f in glob.glob('data/*_final_questions.json'):
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        if 'AMRIGS' in (q.get('institution') or '') and q.get('year') == 2019:
            db_questions.append((f, q))

print(f"Total questões AMRIGS 2019 no banco: {len(db_questions)}")

def norm(txt):
    return re.sub(r'[^a-z0-9]', '', str(txt).lower())

matches = []
unmatched_db = []
unmatched_pdf = set(exam_questions.keys())

for fpath, q in db_questions:
    stmt = norm(q.get('statement', '')[:100])
    opts = norm(' '.join([opt.get('text', '')[:40] for opt in q.get('options', [])]))
    target = stmt + opts
    
    best_num = None
    best_score = 0.0
    
    for qnum in unmatched_pdf:
        pdf_txt = norm(exam_questions[qnum][:300])
        if len(stmt) > 25 and stmt[:40] in pdf_txt:
            best_num = qnum
            best_score = 1.0
            break
        ratio = SequenceMatcher(None, target[:150], pdf_txt[:150]).ratio()
        if ratio > best_score:
            best_score = ratio
            best_num = qnum
            
    if best_score > 0.60 and best_num in unmatched_pdf:
        unmatched_pdf.remove(best_num)
        ans = official_answers.get(best_num)
        matches.append((fpath, q, best_num, ans, best_score))
    else:
        unmatched_db.append((fpath, q, best_score, best_num))

print(f"\n==========================================")
print(f"RESULTADO DO MATCHING:")
print(f"  Casadas com Sucesso: {len(matches)} / {len(db_questions)} ({len(matches)/len(db_questions)*100:.1f}%)")
print(f"  Não casadas DB: {len(unmatched_db)}")
print(f"  Não casadas PDF: {len(unmatched_pdf)}")
print(f"==========================================")

if unmatched_db:
    for f, q, sc, num in unmatched_db[:5]:
        print(f"DB [{sc:.2f}]: {q.get('statement', '')[:80]}")
