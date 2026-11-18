import json
import re
import unicodedata
from collections import defaultdict
from difflib import SequenceMatcher
import time

def normalize_text(text):
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', ' ', text)
    text = unicodedata.normalize('NFKD', text)
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
    return ' '.join(text.split())

def extract_options_text(opts):
    if not opts:
        return []
    if isinstance(opts, str):
        try:
            opts = json.loads(opts)
        except:
            return []
    res = []
    if isinstance(opts, list):
        for o in opts:
            if isinstance(o, dict):
                t = o.get('text', '')
                letter = o.get('letter') or o.get('id') or ''
                res.append((letter, normalize_text(t)))
            elif isinstance(o, str):
                res.append(('', normalize_text(o)))
    return res

with open('data/pending_10k_live.json', 'r', encoding='utf-8') as f:
    pending_list = json.load(f)

with open('data/knowledge/ajudamedico_consolidado_9223.json', 'r', encoding='utf-8') as f:
    ajuda_raw = json.load(f)
    ajuda_list = ajuda_raw['questoes']

ajuda_processed = []
for a in ajuda_list:
    st_norm = normalize_text(a.get('statement', ''))
    opts = extract_options_text(a.get('options'))
    if len(st_norm) < 10:
        continue
    ajuda_processed.append({
        'raw': a,
        'norm_stmt': st_norm,
        'opts': opts,
        'opts_joined': ' '.join(t for _, t in opts)
    })

pending_processed = []
for p in pending_list:
    st_norm = normalize_text(p.get('statement', ''))
    opts = extract_options_text(p.get('options'))
    if len(st_norm) < 10:
        continue
    pending_processed.append({
        'raw': p,
        'norm_stmt': st_norm,
        'opts': opts,
        'opts_joined': ' '.join(t for _, t in opts)
    })

# Inverted index with words of length >= 5
inv_index = defaultdict(list)
for idx, a in enumerate(ajuda_processed):
    words = set(w for w in a['norm_stmt'].split() if len(w) >= 5)
    for w in words:
        inv_index[w].append(idx)
    # Also 30 char prefix
    inv_index[f"P:{a['norm_stmt'][:30]}"].append(idx)

# Filter words appearing > 400 times
inv_index_filtered = {k: v for k, v in inv_index.items() if len(v) <= 400}

matches = []
checked = 0
t0 = time.time()

for p in pending_processed:
    p_words = set(w for w in p['norm_stmt'].split() if len(w) >= 5)
    pref = f"P:{p['norm_stmt'][:30]}"
    
    cand_votes = defaultdict(int)
    if pref in inv_index:
        for a_idx in inv_index[pref]:
            cand_votes[a_idx] += 8
    
    for w in p_words:
        if w in inv_index_filtered:
            for a_idx in inv_index_filtered[w]:
                cand_votes[a_idx] += 1
                
    # Candidate if shares at least 2 long words or prefix
    candidates = [a_idx for a_idx, cnt in cand_votes.items() if cnt >= 2]
    
    best_match = None
    best_sim = 0
    
    for a_idx in candidates:
        checked += 1
        a = ajuda_processed[a_idx]
        
        len_p = len(p['norm_stmt'])
        len_a = len(a['norm_stmt'])
        if len_p == 0 or len_a == 0:
            continue
        ratio = len_p / len_a
        if ratio < 0.65 or ratio > 1.55:
            continue
            
        stmt_sim = SequenceMatcher(None, p['norm_stmt'], a['norm_stmt']).ratio()
        if stmt_sim >= 0.85:
            # Check options
            matched_opts = 0
            tot_opts = max(len(p['opts']), len(a['opts']))
            for _, p_text in p['opts']:
                if any(SequenceMatcher(None, p_text, a_text).ratio() >= 0.85 for _, a_text in a['opts']):
                    matched_opts += 1
            
            opts_cov = matched_opts / max(1, tot_opts)
            
            opts_str_sim = 0
            if p['opts_joined'] and a['opts_joined']:
                opts_str_sim = SequenceMatcher(None, p['opts_joined'], a['opts_joined']).ratio()
                
            eff_opts_sim = max(opts_cov, opts_str_sim)
            
            if eff_opts_sim >= 0.85:
                # Find mapped letter
                ajuda_ans = a['raw'].get('officialAnswer', '').strip().upper()
                mapped_letter = None
                for a_let, a_text in a['opts']:
                    if a_let == ajuda_ans:
                        for p_let, p_text in p['opts']:
                            if SequenceMatcher(None, a_text, p_text).ratio() >= 0.85:
                                mapped_letter = p_let
                                break
                        break
                if not mapped_letter:
                    mapped_letter = ajuda_ans
                    
                score = (stmt_sim + eff_opts_sim) / 2.0
                if score > best_sim:
                    best_sim = score
                    best_match = {
                        'pending_id': p['raw']['id'],
                        'ajuda_id': a['raw']['id'],
                        'institution': p['raw'].get('institution'),
                        'year': p['raw'].get('year'),
                        'banca': p['raw'].get('banca'),
                        'stmt_similarity': round(stmt_sim, 4),
                        'opts_similarity': round(eff_opts_sim, 4),
                        'combined_similarity': round(score, 4),
                        'ajuda_official_answer': ajuda_ans,
                        'resolved_letter': mapped_letter,
                        'ajuda_explanation': (a['raw'].get('medicalExplanation') or '')[:160],
                        'pending_statement': p['raw']['statement'][:140],
                        'pending_options': p['raw'].get('options')
                    }
                    
    if best_match:
        matches.append(best_match)

print(f"Refined search concluída em {time.time()-t0:.1f}s.")
print(f"Total de pares checados: {checked}")
print(f"Total de matches com similaridade >= 85%: {len(matches)}")

with open('data/resultado_cruzamento_ajudamedico_10k_final.json', 'w', encoding='utf-8') as f:
    json.dump({
        'totalMatches': len(matches),
        'criterio': 'similaridade enunciado >= 85% E alternativas >= 85%',
        'matches': matches
    }, f, ensure_ascii=False, indent=2)
