import json
import glob
import re
import unicodedata

def normalize_text(text):
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'^(?:quest[aã]o\s*\d+[\s:\-–—.]*|\d+[\s:\-–—.)]+)\s*', '', text, flags=re.IGNORECASE)
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

print("Analyzing years 2025, 2024, 2023...")

years_to_test = [2025, 2024, 2023]

# Load local questions for these years
local_by_year = {y: [] for y in years_to_test}
for fpath in glob.glob('data/*_final_questions.json'):
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        y = q.get('year')
        if y in local_by_year:
            local_by_year[y].append({
                'id': q.get('id'),
                'statement': q.get('statement', ''),
                'norm_statement': normalize_text(q.get('statement', '')),
                'options': q.get('options', []),
                'correct_answer': q.get('correct_answer', '')
            })

for y in years_to_test:
    scraped_y = []
    for fpath in glob.glob(f'data/scraped_exams/raw/{y}/*.json'):
        with open(fpath, 'r', encoding='utf-8') as f:
            d = json.load(f)
        for q in d.get('questions', []):
            scraped_y.append({
                'text': q.get('text', ''),
                'norm_statement': normalize_text(q.get('text', '')),
                'answerIndex': q.get('answerIndex'),
                'alternatives': q.get('alternatives', [])
            })
    
    scraped_index = {}
    for sq in scraped_y:
        ns = sq['norm_statement']
        if ns and len(ns) >= 20:
            scraped_index.setdefault(ns, []).append(sq)
            
    matches = 0
    scrambled = 0
    option_matched = 0
    unmatched_opt = 0
    filled_missing = 0
    
    for lq in local_by_year[y]:
        ns = lq['norm_statement']
        if ns in scraped_index:
            matches += 1
            sq = scraped_index[ns][0]
            ai = sq.get('answerIndex')
            if ai is not None and 0 <= ai < len(sq['alternatives']):
                source_alt = sq['alternatives'][ai]
                norm_src_txt = normalize_text(source_alt.get('text', ''))
                
                matched_opts = []
                for opt in lq['options']:
                    norm_opt_txt = normalize_text(opt.get('text', ''))
                    if norm_opt_txt == norm_src_txt:
                        matched_opts.append(opt)
                    elif len(norm_opt_txt) > 10 and len(norm_src_txt) > 10:
                        if norm_opt_txt in norm_src_txt or norm_src_txt in norm_opt_txt:
                            matched_opts.append(opt)
                            
                if len(matched_opts) == 1:
                    assigned_letter = matched_opts[0]['letter']
                    source_letter = chr(65 + ai)
                    option_matched += 1
                    if assigned_letter != source_letter:
                        scrambled += 1
                    if not lq['correct_answer']:
                        filled_missing += 1
                else:
                    unmatched_opt += 1
                    
    print(f"Year {y}: Local={len(local_by_year[y])}, Scraped={len(scraped_y)}, Stmt Matches={matches}, "
          f"Option Exact Match={option_matched}, Scrambled Order Avoided={scrambled}, "
          f"Missing Gabaritos Recoverable={filled_missing}, Ambiguous/NoOptMatch={unmatched_opt}")

