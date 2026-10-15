import json
import glob
import re
import unicodedata

def normalize(text):
    if not text:
        return ""
    text = unicodedata.normalize('NFKD', text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    return " ".join(text.lower().split())

with open('data/official_exams/AMRIGS/amrigs_2024_prova_extracted.txt', 'r', encoding='utf-8') as f:
    prova_text = f.read()

# Let's split prova_text by QUESTÃO XX
# In Fundatec / AMRIGS proofs, questions usually start with "QUESTÃO XX" or "QUESTÃO 01"
q_splits = re.split(r'(QUEST[ÃA]O\s+(\d+))', prova_text)
print("Splits found:", len(q_splits))

# Let's build a dict question_num -> question_text
q_dict = {}
for i in range(1, len(q_splits), 3):
    header = q_splits[i]
    q_num = int(q_splits[i+1])
    content = q_splits[i+2]
    q_dict[q_num] = content

print(f"Parsed {len(q_dict)} questions from prova: {sorted(q_dict.keys())[:10]} ... {sorted(q_dict.keys())[-10:]}")

gabarito_2025 = {
    1: 'D', 2: 'B', 3: 'A', 4: 'C', 5: 'ANULADA', 6: 'B', 7: 'B', 8: 'C', 9: 'B', 10: 'C',
    11: 'C', 12: 'D', 13: 'C', 14: 'D', 15: 'A', 16: 'C', 17: 'C', 18: 'D', 19: 'B', 20: 'D',
    21: 'B', 22: 'C', 23: 'C', 24: 'D', 25: 'B', 26: 'D', 27: 'B', 28: 'D', 29: 'C', 30: 'B',
    31: 'A', 32: 'C', 33: 'B', 34: 'A', 35: 'C', 36: 'A', 37: 'C', 38: 'B', 39: 'C', 40: 'A',
    41: 'A', 42: 'B', 43: 'C', 44: 'D', 45: 'A', 46: 'A', 47: 'C', 48: 'B', 49: 'A', 50: 'B',
    51: 'D', 52: 'A', 53: 'D', 54: 'A', 55: 'D', 56: 'A', 57: 'D', 58: 'C', 59: 'A', 60: 'A',
    61: 'D', 62: 'B', 63: 'D', 64: 'A', 65: 'A', 66: 'ANULADA', 67: 'B', 68: 'C', 69: 'B', 70: 'C',
    71: 'A', 72: 'D', 73: 'D', 74: 'ANULADA', 75: 'A', 76: 'B', 77: 'A', 78: 'D', 79: 'D', 80: 'C',
    81: 'C', 82: 'A', 83: 'B', 84: 'D', 85: 'C', 86: 'A', 87: 'D', 88: 'C', 89: 'D', 90: 'B',
    91: 'D', 92: 'B', 93: 'A', 94: 'A', 95: 'C', 96: 'B', 97: 'C', 98: 'B', 99: 'C', 100: 'A'
}

# Unsolved questions
unsolved = []
for fpath in glob.glob('data/*_final_questions.json'):
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        if 'AMRIGS' in str(q.get('institution', '')).upper() and q.get('year') == 2025 and not q.get('official_audit'):
            unsolved.append((fpath, q))

print(f"\nMatching {len(unsolved)} questions against parsed exam:")

matches = []
for fpath, q in unsolved:
    stmt = q.get('statement') or q.get('text') or ''
    norm_stmt = normalize(stmt)
    # Extract salient keywords (words >= 5 letters)
    words = [w for w in re.findall(r'[a-z]+', norm_stmt) if len(w) >= 5]
    best_q = None
    best_score = 0
    for q_num, content in q_dict.items():
        norm_content = normalize(content)
        # count keyword matches
        score = sum(1 for w in words if w in norm_content)
        if score > best_score:
            best_score = score
            best_q = q_num
    
    # check ratio
    ratio = best_score / max(1, len(words))
    ans = gabarito_2025.get(best_q)
    print(f"ID {q['id']} -> Q{best_q} (score {best_score}/{len(words)}, ratio {ratio:.2f}) | Gabarito: {ans}")
    matches.append({
        'file': fpath,
        'id': q['id'],
        'q_num': best_q,
        'score': best_score,
        'ratio': ratio,
        'ans': ans,
        'snippet': " ".join(stmt.split())[:80]
    })

with open('data/official_exams/AMRIGS/amrigs_2025_matches.json', 'w', encoding='utf-8') as f:
    json.dump(matches, f, indent=2, ensure_ascii=False)
