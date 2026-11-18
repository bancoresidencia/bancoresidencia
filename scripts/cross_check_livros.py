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

print("Carregando 10.005 pendentes...")
with open('data/pending_remaining_10005.json', 'r', encoding='utf-8') as f:
    pending_list = json.load(f)

print("Carregando questoes_ineditas_livros_drive_7822.json...")
with open('data/questoes_ineditas_livros_drive_7822.json', 'r', encoding='utf-8') as f:
    ineditas_list = json.load(f)

print(f"Pendentes: {len(pending_list)} | Inéditas Livros: {len(ineditas_list)}")

# Pré-processar
ineditas_processed = []
for idx, item in enumerate(ineditas_list):
    st_raw = item.get('statement', '')
    # O statement pode ter o cabeçalho no início (ex: 'HC) 2021 Residência...')
    st_norm = normalize_text(st_raw)
    ans = (item.get('official_answer') or '').strip().upper()
    if len(st_norm) < 20 or not ans:
        continue
    ineditas_processed.append({
        'idx': idx,
        'raw': item,
        'norm_stmt': st_norm,
        'ans': ans
    })

pending_processed = []
for p in pending_list:
    st_norm = normalize_text(p.get('statement', ''))
    opts = extract_options_text(p.get('options'))
    if len(st_norm) < 20:
        continue
    pending_processed.append({
        'raw': p,
        'norm_stmt': st_norm,
        'opts': opts
    })

print(f"Válidos: {len(pending_processed)} pendentes, {len(ineditas_processed)} inéditas livros")

# Construir índice invertido
stop_words = {
    'paciente', 'apresenta', 'apresentando', 'quadro', 'exame', 'medico', 'clinica',
    'diagnostico', 'tratamento', 'conduta', 'abaixo', 'assinale', 'alternativa', 'correta',
    'incorreta', 'seguinte', 'relacao', 'segundo', 'acordo', 'homem', 'mulher', 'crianca',
    'hospital', 'pronto', 'socorro', 'ambulatorio', 'atendimento', 'evoluiu', 'residencia',
    'medica', 'questoes', 'caso'
}

inv_index = defaultdict(list)
for idx, item in enumerate(ineditas_processed):
    words = set(w for w in item['norm_stmt'].split() if len(w) >= 6 and w not in stop_words)
    for w in words:
        inv_index[w].append(idx)

inv_filtered = {k: v for k, v in inv_index.items() if len(v) <= 300}
print(f"Índice invertido com {len(inv_filtered)} chaves.")

matches_livros = []
checked = 0
t0 = time.time()

for p in pending_processed:
    p_words = set(w for w in p['norm_stmt'].split() if len(w) >= 6 and w not in stop_words)
    cand_votes = defaultdict(int)
    for w in p_words:
        if w in inv_filtered:
            for i_idx in inv_filtered[w]:
                cand_votes[i_idx] += 1
                
    min_overlap = max(3, int(len(p_words) * 0.35))
    candidates = [i_idx for i_idx, cnt in cand_votes.items() if cnt >= min_overlap]
    
    best_match = None
    best_sim = 0
    
    for i_idx in candidates:
        checked += 1
        item = ineditas_processed[i_idx]
        
        # Testar substring ou SequenceMatcher
        # Muitas vezes o item do livro tem o texto da questão embutido após o cabeçalho
        p_stmt = p['norm_stmt']
        i_stmt = item['norm_stmt']
        
        # Checar se um está contido no outro ou similaridade
        sim = 0
        if p_stmt in i_stmt or i_stmt in p_stmt:
            sim = 1.0
        else:
            len_ratio = len(p_stmt) / max(1, len(i_stmt))
            if 0.65 <= len_ratio <= 1.55:
                sim = SequenceMatcher(None, p_stmt, i_stmt).ratio()
            else:
                # Se i_stmt tem o statement no final (após código do livro)
                if len(p_stmt) > 50 and p_stmt[:50] in i_stmt:
                    sim = 0.95
                    
        if sim >= 0.85:
            # Checar opções do pending contra o comentário do livro (que contém o gabarito comentado)
            comm_norm = normalize_text(item['raw'].get('commentary', ''))
            ans_letter = item['ans']
            
            # Verificar se a letra do gabarito é A, B, C, D ou E
            if ans_letter in ['A', 'B', 'C', 'D', 'E']:
                if sim > best_sim:
                    best_sim = sim
                    best_match = {
                        'pending_id': p['raw']['id'],
                        'source': 'questoes_ineditas_livros_drive_7822',
                        'book': item['raw'].get('book'),
                        'spec': item['raw'].get('spec'),
                        'header': item['raw'].get('header'),
                        'institution': p['raw'].get('institution'),
                        'year': p['raw'].get('year'),
                        'similarity': round(sim, 4),
                        'official_answer': ans_letter,
                        'pending_statement': p['raw']['statement'][:140],
                        'commentary_snippet': item['raw'].get('commentary', '')[:200]
                    }
                    
    if best_match:
        matches_livros.append(best_match)

print(f"\nCruzamento Inéditas Livros concluído em {time.time()-t0:.1f}s!")
print(f"Pares checados: {checked}")
print(f"Total de matches >= 85%: {len(matches_livros)}")

with open('data/resultado_matches_livros_ineditas.json', 'w', encoding='utf-8') as f:
    json.dump({
        'total': len(matches_livros),
        'matches': matches_livros
    }, f, ensure_ascii=False, indent=2)

for m in matches_livros[:5]:
    print(f"- [{m['institution']} - {m['year']}] Sim: {m['similarity']*100:.1f}% -> Gabarito: {m['official_answer']} (Livro: {m['book']})")
