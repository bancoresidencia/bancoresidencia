import glob
import json
import re
import unicodedata
import pypdf

def normalize(text):
    if not text:
        return ""
    text = unicodedata.normalize('NFKD', text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    return " ".join(text.lower().split())

# 1. Full Official Gabarito for AMRIGS 02/2023 (applied 19/11/2023 -> DB Year 2024)
gabarito_2024 = {
    1: 'C', 2: 'B', 3: 'B', 4: 'A', 5: 'B', 6: 'B', 7: 'A', 8: 'B', 9: 'D', 10: 'D',
    11: 'C', 12: 'B', 13: 'A', 14: 'B', 15: 'C', 16: 'D', 17: 'A', 18: 'C', 19: 'D', 20: 'B',
    21: 'C', 22: 'C', 23: 'C', 24: 'B', 25: 'C', 26: 'A', 27: 'C', 28: 'B', 29: 'A', 30: 'B',
    31: 'B', 32: 'A', 33: 'D', 34: 'A', 35: 'A', 36: 'B', 37: 'A', 38: 'B', 39: 'D', 40: 'D',
    41: 'C', 42: 'D', 43: 'D', 44: 'C', 45: 'D', 46: 'A', 47: 'D', 48: 'D', 49: 'D', 50: 'C',
    51: 'C', 52: 'D', 53: 'C', 54: 'A', 55: 'B', 56: 'B', 57: 'B', 58: 'C', 59: 'C', 60: 'D',
    61: 'A', 62: 'B', 63: 'D', 64: 'B', 65: 'D', 66: 'B', 67: 'D', 68: 'C', 69: 'D', 70: 'A',
    71: 'A', 72: 'A', 73: 'A', 74: 'A', 75: 'D', 76: 'C', 77: 'B', 78: 'B', 79: 'A', 80: 'C',
    81: 'C', 82: 'A', 83: 'B', 84: 'C', 85: 'D', 86: 'B', 87: 'D', 88: 'B', 89: 'B', 90: 'D',
    91: 'C', 92: 'C', 93: 'A', 94: 'D', 95: 'B', 96: 'C', 97: 'A', 98: 'ANULADA', 99: 'D', 100: 'D'
}

# 2. Extract AMRIGS_2023_PROVA.pdf
reader = pypdf.PdfReader('data/official_exams/AMRIGS/AMRIGS_2023_PROVA.pdf')
print("Pages in AMRIGS_2023_PROVA.pdf:", len(reader.pages))

prova_text = ""
for i, page in enumerate(reader.pages):
    prova_text += f"\n--- PAGE {i+1} ---\n" + (page.extract_text() or "")

with open('data/official_exams/AMRIGS/amrigs_2023_prova_extracted.txt', 'w', encoding='utf-8') as f:
    f.write(prova_text)

# Parse questions
q_splits = re.split(r'(QUEST[ÃA]O\s+(\d+))', prova_text)
q_dict = {}
for i in range(1, len(q_splits), 3):
    q_num = int(q_splits[i+1])
    content = q_splits[i+2]
    q_dict[q_num] = content

print(f"Parsed {len(q_dict)} questions from prova: {sorted(q_dict.keys())[:10]} ... {sorted(q_dict.keys())[-10:]}")

# 3. Find unhomologated questions for AMRIGS 2024
unsolved = []
for fpath in glob.glob('data/*_final_questions.json'):
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        if 'AMRIGS' in str(q.get('institution', '')).upper() and q.get('year') == 2024 and not q.get('official_audit'):
            unsolved.append((fpath, q))

print(f"\nTotal unsolved AMRIGS 2024: {len(unsolved)}")

matches = []
for fpath, q in unsolved:
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
    ans = gabarito_2024.get(best_q)
    print(f"ID {q['id']} -> Q{best_q} (score {best_score}/{len(words)}, ratio {ratio:.2f}) | Ans: {ans}")
    matches.append({
        'file': fpath,
        'id': q['id'],
        'q_num': best_q,
        'score': best_score,
        'ratio': ratio,
        'ans': ans,
        'snippet': " ".join(stmt.split())[:80]
    })

with open('data/official_exams/AMRIGS/amrigs_2024_matches.json', 'w', encoding='utf-8') as f:
    json.dump(matches, f, indent=2, ensure_ascii=False)
print("Saved amrigs_2024_matches.json")
