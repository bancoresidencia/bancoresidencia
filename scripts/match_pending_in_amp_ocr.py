import json
import re

# Load pending AMP questions
with open('data/pending_amp_questions.json', 'r', encoding='utf-8') as f:
    pending = json.load(f)

# Load OCR pages
with open('data/amp_2024_pages/ocr_all_pages.json', 'r', encoding='utf-8-sig') as f:
    ocr_pages = json.load(f)

full_ocr = ""
for p in ocr_pages:
    full_ocr += f"\n--- {p['page']} ---\n" + p['text']

def clean_text(t):
    if not t: return ""
    t = re.sub(r'[^a-zA-Z0-9]', ' ', t.lower())
    return ' '.join(t.split())

for q in pending:
    words = clean_text(q['statement']).split()
    # pick first 8 distinctive words (length >= 4)
    dist = [w for w in words if len(w) >= 4][:8]
    found = False
    for p in ocr_pages:
        p_clean = clean_text(p['text'])
        # check how many dist words are in p_clean
        matches = sum(1 for w in dist if w in p_clean)
        if matches >= 5:
            print(f"\n[MATCH FOUND] {q['code']} (Ano: {q['year']}, Esp: {q['especialidade']})")
            print(f"  Página: {p['page']} (dist words matched: {matches}/{len(dist)})")
            print(f"  Trecho DB: {q['statement'][:120]}...")
            found = True
            break
    if not found:
        print(f"[NAO ENCONTRADO NO AMP 2024] {q['code']} (Ano: {q['year']}): {q['statement'][:80]}...")

