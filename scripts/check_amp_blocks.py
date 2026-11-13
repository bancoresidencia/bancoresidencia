import json
import re

with open('data/pending_amp_questions.json', 'r', encoding='utf-8') as f:
    pending = json.load(f)

with open('data/amp_2024_pages/ocr_all_pages.json', 'r', encoding='utf-8-sig') as f:
    ocr_pages = json.load(f)

ans_map = {
    1: 'A', 2: 'B', 3: 'D', 4: 'A', 5: 'B', 6: 'D', 7: 'D', 8: 'A', 9: 'C', 10: 'D',
    11: 'C', 12: 'D', 13: 'D', 14: 'D', 15: 'B', 16: 'D', 17: 'E', 18: 'ANULADA', 19: 'B', 20: 'C',
    21: 'D', 22: 'D', 23: 'E', 24: 'B', 25: 'E', 26: 'A', 27: 'A', 28: 'E', 29: 'E', 30: 'C',
    31: 'A', 32: 'D', 33: 'C', 34: 'C', 35: 'B', 36: 'D', 37: 'E', 38: 'C', 39: 'D', 40: 'D',
    41: 'E', 42: 'C', 43: 'B', 44: 'E', 45: 'C', 46: 'E', 47: 'B', 48: 'D', 49: 'D', 50: 'E',
    51: 'D', 52: 'C', 53: 'E', 54: 'C', 55: 'E', 56: 'A', 57: 'B', 58: 'D', 59: 'D', 60: 'A',
    61: 'E', 62: 'D', 63: 'A', 64: 'D', 65: 'E', 66: 'B', 67: 'E', 68: 'A', 69: 'C', 70: 'C',
    71: 'E', 72: 'B', 73: 'D', 74: 'B', 75: 'D', 76: 'A', 77: 'E', 78: 'B', 79: 'B', 80: 'D',
    81: 'D', 82: 'A', 83: 'E', 84: 'D', 85: 'D', 86: 'E', 87: 'A', 88: 'D', 89: 'A', 90: 'E',
    91: 'D', 92: 'C', 93: 'D', 94: 'E', 95: 'D', 96: 'C', 97: 'E', 98: 'A', 99: 'C', 100: 'B'
}

def clean_lexical(text):
    if not text: return ""
    t = text.lower()
    t = re.sub(r'[\u0300-\u036f]', '', t)
    t = re.sub(r'\b(\d+)([a-zA-Z]+)\b', r'\1 \2', t)
    t = re.sub(r'[^a-z0-9]', ' ', t)
    return ' '.join(t.split())

full_ocr = ""
for p in ocr_pages:
    full_ocr += f"\n--- {p['page']} ---\n" + p['text']

# Split OCR into questions by regex (1..100)
q_blocks = {}
# Find occurrences of question numbers
matches = list(re.finditer(r'(?:^|\n|\s)(\b\d{1,2}\b|100)\s*[\)\.\-]\s+', full_ocr))
for i in range(len(matches)):
    q_num = int(matches[i].group(1))
    start = matches[i].start()
    end = matches[i+1].start() if i+1 < len(matches) else len(full_ocr)
    q_blocks[q_num] = full_ocr[start:end]

print(f"Total blocos de questões mapeados no OCR: {len(q_blocks)}")

# Now test each pending question against all blocks
found_matches = []
for q in pending:
    c_stmt = clean_lexical(q['statement'])
    words = c_stmt.split()
    if len(words) < 5: continue
    
    best_sim = 0
    best_num = None
    for num, block in q_blocks.items():
        c_block = clean_lexical(block)
        # Jaccard + Bigram
        w1 = set(words)
        w2 = set(c_block.split())
        inter = len(w1.intersection(w2))
        sim = inter / len(w1) # recall of question words in block
        if sim > best_sim:
            best_sim = sim
            best_num = num
            
    if best_sim >= 0.70:
        found_matches.append({
            'code': q['code'],
            'year': q['year'],
            'esp': q['especialidade'],
            'qNum': best_num,
            'sim': best_sim,
            'gb': ans_map.get(best_num),
            'stmt_db': q['statement'][:100],
            'options': q['options']
        })

print(f"\nTotal correspondências encontradas com recall >= 70%: {len(found_matches)}")
for fm in found_matches:
    print(f"\n[MATCH] {fm['code']} (Ano: {fm['year']}) -> Prova Geral Questão #{fm['qNum']} (Recall: {fm['sim']*100:.1f}%)")
    print(f"  GB Oficial: {fm['gb']}")
    print(f"  DB: {fm['stmt_db']}...")

