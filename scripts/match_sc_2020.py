import pypdf
import json
import re
import sys
import glob
import unicodedata

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def normalize(text):
    if not text:
        return ""
    text = unicodedata.normalize('NFKD', text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    return " ".join(text.lower().split())

# 1. Official Gabarito for Santa Casa SP 2020 (Acesso Direto, applied 23/11/2019)
gabarito_sc_2020 = {
    1: 'E', 2: 'B', 3: 'D', 4: 'E', 5: 'C', 6: 'D', 7: 'C', 8: 'A', 9: 'A', 10: 'B',
    11: 'D', 12: 'B', 13: 'E', 14: 'C', 15: 'A', 16: 'A', 17: 'D', 18: 'E', 19: 'B', 20: 'C',
    21: 'A', 22: 'C', 23: 'D', 24: 'E', 25: 'A', 26: 'B', 27: 'C', 28: 'E', 29: 'D', 30: 'B',
    31: 'A', 32: 'C', 33: 'D', 34: 'E', 35: 'B', 36: 'A', 37: 'C', 38: 'B', 39: 'D', 40: 'E',
    41: 'C', 42: 'D', 43: 'B', 44: 'E', 45: 'E', 46: 'A', 47: 'C', 48: 'B', 49: 'D', 50: 'D',
    51: 'A', 52: 'A', 53: 'B', 54: 'C', 55: 'E', 56: 'B', 57: 'D', 58: 'C', 59: 'E', 60: 'A',
    61: 'B', 62: 'D', 63: 'C', 64: 'C', 65: 'A', 66: 'E', 67: 'E', 68: 'C', 69: 'D', 70: 'A',
    71: 'D', 72: 'B', 73: 'C', 74: 'A', 75: 'E', 76: 'B', 77: 'E', 78: 'B', 79: 'A', 80: 'D',
    81: 'C', 82: 'A', 83: 'E', 84: 'A', 85: 'C', 86: 'D', 87: 'A', 88: 'D', 89: 'C', 90: 'B',
    91: 'A', 92: 'D', 93: 'E', 94: 'B', 95: 'C', 96: 'B', 97: 'A', 98: 'C', 99: 'B', 100: 'E'
}

# 2. Extract prova text
pdf_path = 'data/official_exams/SANTA_CASA_SP/SANTA_CASA_2020_PROVAS/100_ISCMSP_RM_2020_Programa_Acesso_Direto_QUADRIX_Cad. Prova.pdf'
reader = pypdf.PdfReader(pdf_path)
full_text = ""
for page_num, p in enumerate(reader.pages):
    txt = p.extract_text() or ""
    full_text += f"\n--- PAGE {page_num+1} ---\n" + txt

with open('data/official_exams/SANTA_CASA_SP/sc_2020_prova_extracted.txt', 'w', encoding='utf-8') as f:
    f.write(full_text)

# Split by QUESTÃO XX
q_splits = re.split(r'(QUEST[ÃA]O\s+(\d+))', full_text)
q_dict = {}
for i in range(1, len(q_splits), 3):
    q_num = int(q_splits[i+1])
    content = q_splits[i+2]
    q_dict[q_num] = content

print(f"Extracted {len(q_dict)} questions from Santa Casa 2020 prova: {sorted(q_dict.keys())[:10]} ... {sorted(q_dict.keys())[-10:]}")

# 3. Find Santa Casa 2020 questions in DB
sc_db_2020 = []
for fpath in glob.glob('data/*_final_questions.json'):
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        inst = (q.get('institution') or '').upper()
        if ('SANTA CASA DE SÃO PAULO' in inst or 'ISCMSP' in inst or 'FCMSCSP' in inst) and q.get('year') == 2020:
            sc_db_2020.append((fpath, q))

print(f"Found {len(sc_db_2020)} questions in DB for Santa Casa SP 2020")

# 4. Match questions
matches = []
for fpath, q in sc_db_2020:
    stmt = q.get('statement') or q.get('text') or ''
    norm_stmt = normalize(stmt)
    words = [w for w in re.findall(r'[a-z]+', norm_stmt) if len(w) >= 5]
    best_q = None
    best_score = 0
    for q_num, content in q_dict.items():
        norm_content = normalize(content)
        score = sum(1 for w in words if w in norm_content)
        if score > best_score:
            best_score = score
            best_q = q_num
    
    ratio = best_score / max(1, len(words))
    ans = gabarito_sc_2020.get(best_q)
    matches.append({
        'file': fpath,
        'id': q['id'],
        'q_num': best_q,
        'score': best_score,
        'total_words': len(words),
        'ratio': ratio,
        'ans': ans,
        'snippet': " ".join(stmt.split())[:80]
    })

high_matches = [m for m in matches if m['ratio'] >= 0.7]
print(f"Matched {len(high_matches)} / {len(sc_db_2020)} questions with ratio >= 0.70!")

with open('data/official_exams/SANTA_CASA_SP/sc_2020_matches.json', 'w', encoding='utf-8') as f:
    json.dump(matches, f, indent=2, ensure_ascii=False)
