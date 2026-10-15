import pypdf
import json
import re
import sys
import glob
import unicodedata
from datetime import datetime

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def normalize(text):
    if not text:
        return ""
    text = unicodedata.normalize('NFKD', text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    return " ".join(text.lower().split())

# 1. Official Gabarito for Santa Casa SP 2021 (Acesso Direto, applied 20/12/2020)
gabarito_sc_2021 = {
    1: 'D', 2: 'D', 3: 'E', 4: 'A', 5: 'A', 6: 'C', 7: 'C', 8: 'C', 9: 'A', 10: 'B',
    11: 'B', 12: 'ANULADA', 13: 'E', 14: 'B', 15: 'B', 16: 'E', 17: 'B', 18: 'E', 19: 'A', 20: 'D',
    21: 'D', 22: 'A', 23: 'E', 24: 'A', 25: 'C', 26: 'D', 27: 'C', 28: 'A', 29: 'E', 30: 'D',
    31: 'E', 32: 'C', 33: 'B', 34: 'ANULADA', 35: 'A', 36: 'B', 37: 'B', 38: 'C', 39: 'E', 40: 'A',
    41: 'C', 42: 'D', 43: 'E', 44: 'D', 45: 'A', 46: 'A', 47: 'C', 48: 'A', 49: 'C', 50: 'B',
    51: 'D', 52: 'B', 53: 'B', 54: 'ANULADA', 55: 'D', 56: 'B', 57: 'E', 58: 'D', 59: 'E', 60: 'A',
    61: 'D', 62: 'C', 63: 'E', 64: 'B', 65: 'A', 66: 'C', 67: 'D', 68: 'C', 69: 'E', 70: 'B',
    71: 'C', 72: 'D', 73: 'B', 74: 'E', 75: 'A', 76: 'B', 77: 'A', 78: 'D', 79: 'A', 80: 'E',
    81: 'D', 82: 'C', 83: 'B', 84: 'E', 85: 'ANULADA', 86: 'E', 87: 'E', 88: 'D', 89: 'D', 90: 'A',
    91: 'B', 92: 'ANULADA', 93: 'B', 94: 'C', 95: 'B', 96: 'E', 97: 'D', 98: 'A', 99: 'C', 100: 'C'
}

# 2. Extract prova text
pdf_path = 'data/official_exams/SANTA_CASA_SP/SANTA_CASA_2021_PROVAS/QUADRIX_Cad_Prova_001_Programa_Acesso_Direto_ISCMSP_RM-2021.pdf'
reader = pypdf.PdfReader(pdf_path)
full_text = ""
for page_num, p in enumerate(reader.pages):
    txt = p.extract_text() or ""
    full_text += f"\n--- PAGE {page_num+1} ---\n" + txt

with open('data/official_exams/SANTA_CASA_SP/sc_2021_prova_extracted.txt', 'w', encoding='utf-8') as f:
    f.write(full_text)

# Split by QUESTÃO XX
q_splits = re.split(r'(QUEST[ÃA]O\s+(\d+))', full_text)
q_dict = {}
for i in range(1, len(q_splits), 3):
    q_num = int(q_splits[i+1])
    content = q_splits[i+2]
    q_dict[q_num] = content

print(f"Extracted {len(q_dict)} questions from Santa Casa 2021 prova")

# 3. Find Santa Casa 2021 questions in DB
sc_db_2021 = []
for fpath in glob.glob('data/*_final_questions.json'):
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        inst = (q.get('institution') or '').upper()
        if ('SANTA CASA DE SÃO PAULO' in inst or 'ISCMSP' in inst or 'FCMSCSP' in inst) and q.get('year') == 2021:
            sc_db_2021.append((fpath, q))

print(f"Found {len(sc_db_2021)} questions in DB for Santa Casa SP 2021")

# Match questions
matches = []
for fpath, q in sc_db_2021:
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
    ans = gabarito_sc_2021.get(best_q)
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
print(f"Matched {len(high_matches)} / {len(sc_db_2021)} questions with ratio >= 0.70!")

with open('data/official_exams/SANTA_CASA_SP/sc_2021_matches.json', 'w', encoding='utf-8') as f:
    json.dump(matches, f, indent=2, ensure_ascii=False)
