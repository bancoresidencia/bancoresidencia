import json, glob, re, sys, pypdf
from difflib import SequenceMatcher

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("="*80)
print("TESTANDO MATCHING: AMRIGS DB 2018 COM PROVA/GABARITO CID 438")
print("="*80)

# 1. Read PDF 438
reader = pypdf.PdfReader('data/official_exams/AMRIGS/AMRIGS_2017_PROVA.pdf')
full_text = ''
for p in reader.pages[2:]: # skip instructions
    full_text += p.extract_text() + '\n'

q_blocks = re.findall(r'QUEST[ÃA]O\s+(\d+)\s+[–-]\s+(.*?)(?=QUEST[ÃA]O\s+\d+\s+[–-]|\Z)', full_text, re.DOTALL | re.IGNORECASE)
exam_questions = {}
for qnum_str, qbody in q_blocks:
    qnum = int(qnum_str)
    lines = [l.strip() for l in qbody.split('\n') if l.strip()]
    cleaned = [l for l in lines if '438_AD_' not in l and 'Fundatec' not in l and 'ACESSO DIRETO' not in l]
    exam_questions[qnum] = ' '.join(cleaned)

print(f"Total questões no caderno oficial 438: {len(exam_questions)}")

# 2. Read Gabarito 438
# We read from AMRIGS_2017_GABARITO.pdf
reader_gab = pypdf.PdfReader('data/official_exams/AMRIGS/AMRIGS_2017_GABARITO.pdf')
gab_text = reader_gab.pages[0].extract_text() + '\n' + reader_gab.pages[1].extract_text()
gab_matches = re.findall(r'(\d+)\s+([A-E*])', gab_text)
official_answers = {int(num): ans for num, ans in gab_matches}
print(f"Total respostas no gabarito oficial 438: {len(official_answers)}")

# 3. Load DB questions
db_questions = []
for f in glob.glob('data/*_final_questions.json'):
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
    for q in qs:
        if 'AMRIGS' in (q.get('institution') or '') and q.get('year') == 2018:
            db_questions.append((f, q))

print(f"Total questões AMRIGS 2018 no banco: {len(db_questions)}")

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
