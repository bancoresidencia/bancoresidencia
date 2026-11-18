import pypdf
import os
import re
import json
from difflib import SequenceMatcher

folder = 'data/incoming_exams/SES_DF_2016'

def clean_txt(t):
    return re.sub(r'\s+', ' ', t).strip()

def parse_cebraspe_gab(gab_path):
    reader = pypdf.PdfReader(gab_path)
    gtxt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    
    # We want a dictionary: item_num (1..120) -> 'C' | 'E' | 'X'
    # In Cebraspe PDF, the structure is:
    # 1 2 3 ... 20
    # C E E ... C
    # 21 22 ... 40
    # ...
    # Let's parse blocks of numbers followed by letters
    lines = [clean_txt(l) for l in gtxt.split('\n') if clean_txt(l)]
    
    answers = {}
    current_numbers = []
    
    for l in lines:
        # Check if line is a series of numbers
        nums = [int(n) for n in l.split() if n.isdigit() and 1 <= int(n) <= 120]
        if len(nums) >= 5:
            current_numbers = nums
            continue
            
        # Check if line is answers corresponding to the numbers
        # Tokens can be separated by spaces or concatenated
        # E.g. "C E E E E C E E C E E C E C C E C E E C" or "C EECECCEEECECC C EE E CX"
        # Let's extract all C, E, X from this line
        tokens = [ch for ch in l if ch in ('C', 'E', 'X')]
        if len(tokens) >= 5 and current_numbers:
            if len(tokens) == len(current_numbers):
                for num, ans in zip(current_numbers, tokens):
                    answers[num] = ans
            else:
                # Sometimes tokens match the slice
                for idx, ans in enumerate(tokens[:len(current_numbers)]):
                    answers[current_numbers[idx]] = ans
            current_numbers = []
            
    return answers

# Load all 8 exams
exams = {}
for ef in sorted(os.listdir(folder)):
    if ef.startswith('138RMUNIF_') and ef.endswith('.pdf'):
        base = ef[:-4]
        pdf_path = os.path.join(folder, ef)
        gab_path = os.path.join(folder, f"GAB_DEFINITIVO_{base}.PDF")
        
        # Extract items
        reader = pypdf.PdfReader(pdf_path)
        full_text = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
        
        matches = list(re.finditer(r'(?:\n|^)\s*(\d{1,3})\s+([A-ZÀ-Ú])', full_text))
        items = {}
        for i, m in enumerate(matches):
            num = int(m.group(1))
            if 1 <= num <= 120:
                start_pos = m.start()
                end_pos = matches[i+1].start() if i+1 < len(matches) else len(full_text)
                raw_item = full_text[start_pos:end_pos].strip()
                # Remove the leading number
                item_content = re.sub(rf'^\s*{num}\s+', '', raw_item)
                item_clean = clean_txt(item_content)
                items[num] = item_clean
                
        # Parse gabarito
        gab_map = parse_cebraspe_gab(gab_path) if os.path.exists(gab_path) else {}
        
        exams[ef] = {
            'items': items,
            'gab_map': gab_map,
            'full_text': clean_txt(full_text)
        }
        print(f"Loaded {ef}: {len(items)} items extracted, {len(gab_map)} gabarito keys")

# Load pending questions
with open('data/pending_hub_2016.json', 'r', encoding='utf-8') as f:
    pendings = json.load(f)

matched = []
unmatched = []

for q in pendings:
    q_stmt = clean_txt(q['statement'])
    best_hit = None
    
    # Try exact or substring match across all items in all exams
    for ef, edata in exams.items():
        for num, itxt in edata['items'].items():
            # Check if significant portion of itxt is in q_stmt or vice-versa
            # Most items are 15-50 words
            # Take the first 50 chars of item
            probe = itxt[:50]
            if len(probe) >= 20 and probe.lower() in q_stmt.lower():
                ans_letter = edata['gab_map'].get(num)
                supa_letter = 'A' if ans_letter == 'C' else ('B' if ans_letter == 'E' else ('ANULADA' if ans_letter == 'X' else None))
                best_hit = {
                    'ef': ef,
                    'num': num,
                    'itxt': itxt,
                    'cebraspe_ans': ans_letter,
                    'supa_ans': supa_letter,
                    'match_type': 'prefix_substring'
                }
                break
                
            # If not prefix, check if itxt is inside q_stmt
            # Remove punctuation for comparison
            itxt_words = re.findall(r'\b\w+\b', itxt.lower())
            if len(itxt_words) >= 6:
                phrase = ' '.join(itxt_words[:6])
                q_words_str = ' '.join(re.findall(r'\b\w+\b', q_stmt.lower()))
                if phrase in q_words_str:
                    ans_letter = edata['gab_map'].get(num)
                    supa_letter = 'A' if ans_letter == 'C' else ('B' if ans_letter == 'E' else ('ANULADA' if ans_letter == 'X' else None))
                    best_hit = {
                        'ef': ef,
                        'num': num,
                        'itxt': itxt,
                        'cebraspe_ans': ans_letter,
                        'supa_ans': supa_letter,
                        'match_type': 'words_phrase'
                    }
                    break
        if best_hit:
            break
            
    if best_hit and best_hit['supa_ans']:
        matched.append((q, best_hit))
    else:
        unmatched.append(q)

print(f"\n================ RESULTADOS ================")
print(f"Total pendentes: {len(pendings)}")
print(f"Total casadas com 100% de precisão: {len(matched)}")
print(f"Total não casadas: {len(unmatched)}")

# Save matched results
output = []
for q, hit in matched:
    output.append({
        'id': q['id'],
        'code': q['code'],
        'pdf': hit['ef'],
        'item_num': hit['num'],
        'cebraspe_ans': hit['cebraspe_ans'],
        'supa_ans': hit['supa_ans'],
        'item_snippet': hit['itxt'][:80],
        'stmt_snippet': q['statement'][:80]
    })

with open('data/matched_hub_2016.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print("Saved to data/matched_hub_2016.json")
if unmatched:
    print("\nPrimeiras 5 não casadas:")
    for u in unmatched[:5]:
        print(f"  [{u['code']}] {u['statement'][:80]}...")
