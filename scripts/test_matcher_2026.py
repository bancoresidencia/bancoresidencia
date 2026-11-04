import json
import glob
import re
import unicodedata

def normalize_text(text):
    if not text:
        return ""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Remove common prefixes like "Questao 1:", "1.", "(Questao 01)"
    text = re.sub(r'^(?:quest[aã]o\s*\d+[\s:\-–—.]*|\d+[\s:\-–—.)]+)\s*', '', text, flags=re.IGNORECASE)
    # Normalize unicode (NFD -> remove combining characters -> NFC)
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = text.lower()
    # Normalize whitespace and punctuation
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

print("Loading local 2026 questions...")
local_2026 = []
for fpath in glob.glob('data/*_final_questions.json'):
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        if q.get('year') == 2026:
            local_2026.append({
                'id': q.get('id'),
                'file': fpath,
                'statement': q.get('statement', ''),
                'norm_statement': normalize_text(q.get('statement', '')),
                'options': q.get('options', []),
                'correct_answer': q.get('correct_answer', ''),
                'institution': q.get('institution', ''),
                'banca': q.get('banca', '')
            })

print(f"Total local 2026 questions: {len(local_2026)}")
empty_local = [q for q in local_2026 if not q['correct_answer']]
print(f"Total local 2026 missing correct_answer: {len(empty_local)}")

print("\nLoading scraped 2026 questions...")
scraped_2026 = []
for fpath in glob.glob('data/scraped_exams/raw/2026/*.json'):
    with open(fpath, 'r', encoding='utf-8') as f:
        d = json.load(f)
    for q in d.get('questions', []):
        scraped_2026.append({
            'source_id': q.get('_id'),
            'exam': d.get('exam', {}).get('title', ''),
            'institution': d.get('exam', {}).get('institution', ''),
            'text': q.get('text', ''),
            'norm_statement': normalize_text(q.get('text', '')),
            'answerIndex': q.get('answerIndex'),
            'alternatives': q.get('alternatives', [])
        })

print(f"Total scraped 2026 questions: {len(scraped_2026)}")

# Index scraped questions by normalized statement
scraped_by_norm = {}
for sq in scraped_2026:
    ns = sq['norm_statement']
    if ns and len(ns) >= 20:
        scraped_by_norm.setdefault(ns, []).append(sq)

matches = 0
scrambled_detected = 0
no_option_match = 0
unambiguous_letter_matches = 0

for lq in local_2026:
    ns = lq['norm_statement']
    if ns in scraped_by_norm:
        matches += 1
        sq_candidates = scraped_by_norm[ns]
        sq = sq_candidates[0] # take first candidate
        ai = sq.get('answerIndex')
        if ai is not None and 0 <= ai < len(sq['alternatives']):
            correct_source_alt = sq['alternatives'][ai]
            norm_source_correct_text = normalize_text(correct_source_alt.get('text', ''))
            
            # Find matching option in local question by TEXT
            matched_opts = []
            for opt in lq['options']:
                norm_local_opt_text = normalize_text(opt.get('text', ''))
                # Exact or substring match if reasonably long
                if norm_local_opt_text == norm_source_correct_text:
                    matched_opts.append(opt)
                elif len(norm_local_opt_text) > 10 and len(norm_source_correct_text) > 10:
                    if norm_local_opt_text in norm_source_correct_text or norm_source_correct_text in norm_local_opt_text:
                        matched_opts.append(opt)
            
            if len(matched_opts) == 1:
                assigned_letter = matched_opts[0]['letter']
                source_letter = chr(65 + ai)
                unambiguous_letter_matches += 1
                if assigned_letter != source_letter:
                    scrambled_detected += 1
            else:
                no_option_match += 1

print("\n--- RESULTS OF 2026 TEST ---")
print(f"Statement matches found: {matches}")
print(f"Unambiguous option text matches: {unambiguous_letter_matches}")
print(f"Scrambled booklets detected (letter differed from source index, saved from corruption!): {scrambled_detected}")
print(f"Option text mismatch or ambiguous: {no_option_match}")

