import glob
import json
import pypdf
import unicodedata

def normalize(text):
    if not text:
        return ""
    text = unicodedata.normalize('NFKD', text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    return " ".join(text.lower().split())

# 1. Load official answer key for AMRIGS 01/2024 (Edital 01/2024, applied Nov/2024 -> DB 2025)
# From PDF page 1:
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

# 2. Extract full text of AMRIGS_2024_PROVA.pdf
reader = pypdf.PdfReader('data/official_exams/AMRIGS/AMRIGS_2024_PROVA.pdf')
print("Total pages in AMRIGS_2024_PROVA.pdf:", len(reader.pages))

full_pdf_text = ""
for page_num, p in enumerate(reader.pages):
    txt = p.extract_text() or ""
    full_pdf_text += f"\n--- PAGE {page_num+1} ---\n" + txt

with open('data/official_exams/AMRIGS/amrigs_2024_prova_extracted.txt', 'w', encoding='utf-8') as f:
    f.write(full_pdf_text)
print("Saved amrigs_2024_prova_extracted.txt")

# 3. Find all 19 unhomologated AMRIGS 2025 questions
unsolved = []
for fpath in glob.glob('data/*_final_questions.json'):
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        if 'AMRIGS' in str(q.get('institution', '')).upper() and q.get('year') == 2025:
            if not q.get('official_audit'):
                unsolved.append((fpath, q))

print(f"Total unsolved AMRIGS 2025: {len(unsolved)}")
for fpath, q in unsolved:
    stmt = q.get('statement') or q.get('text') or ''
    print(f"ID: {q['id']} | Spec: {q.get('especialidade')} | File: {fpath}")
    print("  Snippet:", " ".join(stmt.split())[:120])
