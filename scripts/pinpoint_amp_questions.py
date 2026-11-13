import json
import re

with open('data/pending_amp_questions.json', 'r', encoding='utf-8') as f:
    pending = json.load(f)

with open('data/amp_2024_pages/ocr_all_pages.json', 'r', encoding='utf-8-sig') as f:
    ocr_pages = json.load(f)

# Official general exam answer key
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

def clean(t):
    return re.sub(r'\s+', ' ', re.sub(r'[^a-zA-Z0-9]', ' ', t.lower())).strip()

print("--- EXAMINANDO QUESTÕES AMP NO OCR DA PROVA GERAL ---")

for q in pending:
    # find which page
    best_p = None
    best_score = 0
    q_words = set([w for w in clean(q['statement']).split() if len(w) >= 4])
    
    for p in ocr_pages:
        p_words = set([w for w in clean(p['text']).split() if len(w) >= 4])
        inter = len(q_words.intersection(p_words))
        if inter > best_score:
            best_score = inter
            best_p = p

    if best_score >= 5:
        # Search on that page for the question number
        txt = best_p['text']
        # Find all occurrences of number) or number.
        print(f"\n========================================================")
        print(f"DB CODE: {q['code']} | Ano: {q['year']} | Esp: {q['especialidade']}")
        print(f"STATEMENT: {q['statement'][:150]}...")
        print(f"PÁGINA DO PDF: {best_p['page']}")
        
        # Look for question numbers
        q_matches = list(re.finditer(r'(?:^|\n|\s)(\d{1,2}|100)\s*[\)\.\-]\s+', txt))
        matched_num = None
        for i, m in enumerate(q_matches):
            num = int(m.group(1))
            start = m.start()
            end = q_matches[i+1].start() if i+1 < len(q_matches) else len(txt)
            block = txt[start:end]
            # check similarity
            b_words = set([w for w in clean(block).split() if len(w) >= 4])
            inter = len(q_words.intersection(b_words))
            if inter >= 4:
                matched_num = num
                print(f"  >>> NÚMERO NA PROVA: QUESTÃO #{num}")
                print(f"  >>> GABARITO OFICIAL DA BANCA: {ans_map.get(num, 'N/A')}")
                print(f"  >>> TEXTO DO BLOCO OCR:\n{block[:300]}...\n")
                break

