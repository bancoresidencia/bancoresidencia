import json
import re
import unicodedata
from collections import defaultdict
from difflib import SequenceMatcher
import time

def normalize_text(text):
    if not text:
        return ""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Remove accents
    text = unicodedata.normalize('NFKD', text)
    text = ''.join(c for c in text if not unicodedata.combining(c))
    # Lowercase & alphanumeric
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
    # Collapse whitespace
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

print("Carregando arquivos...")
t0 = time.time()
with open('data/pending_10k_live.json', 'r', encoding='utf-8') as f:
    pending_list = json.load(f)

with open('data/knowledge/ajudamedico_consolidado_9223.json', 'r', encoding='utf-8') as f:
    ajuda_raw = json.load(f)
    ajuda_list = ajuda_raw['questoes']

print(f"Carregados {len(pending_list)} pendentes e {len(ajuda_list)} Ajuda Médico em {time.time()-t0:.2f}s")

# Pré-processar
ajuda_processed = []
for a in ajuda_list:
    st_norm = normalize_text(a.get('statement', ''))
    opts = extract_options_text(a.get('options'))
    if len(st_norm) < 15:
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
    if len(st_norm) < 15:
        continue
    pending_processed.append({
        'raw': p,
        'norm_stmt': st_norm,
        'opts': opts,
        'opts_joined': ' '.join(t for _, t in opts)
    })

print(f"Pré-processamento: {len(pending_processed)} pendentes válidos, {len(ajuda_processed)} ajuda válidos")

# Construir índice invertido baseado em palavras distintas significativas (tamanho >= 6)
# Para evitar termos hipercomuns de prova de residência médica (ex: paciente, anos, apresentando)
stop_words = {
    'paciente', 'apresenta', 'apresentando', 'quadro', 'exame', 'medico', 'clinica',
    'diagnostico', 'tratamento', 'conduta', 'abaixo', 'assinale', 'alternativa', 'correta',
    'incorreta', 'seguinte', 'relacao', 'segundo', 'acordo', 'homem', 'mulher', 'crianca',
    'hospital', 'pronto', 'socorro', 'ambulatorio', 'atendimento', 'evoluiu'
}

inv_index = defaultdict(list)
for idx, a in enumerate(ajuda_processed):
    words = set(w for w in a['norm_stmt'].split() if len(w) >= 6 and w not in stop_words)
    # Também incluir 4-gramas de palavras ou prefixo de 30 chars
    prefix = a['norm_stmt'][:40]
    inv_index[f"PREF:{prefix}"].append(idx)
    for w in words:
        inv_index[w].append(idx)

# Filtrar palavras muito frequentes no índice (> 500 ocorrências)
inv_index_filtered = {k: v for k, v in inv_index.items() if len(v) <= 300}

print(f"Índice invertido construído com {len(inv_index_filtered)} chaves")

# Cruzamento
matches = []
checked_pairs = 0
t_start = time.time()

for p_idx, p in enumerate(pending_processed):
    p_words = set(w for w in p['norm_stmt'].split() if len(w) >= 6 and w not in stop_words)
    p_prefix = f"PREF:{p['norm_stmt'][:40]}"
    
    # Contar votos dos candidatos
    candidate_counts = defaultdict(int)
    if p_prefix in inv_index:
        for a_idx in inv_index[p_prefix]:
            candidate_counts[a_idx] += 10 # forte bônus para prefixo igual
            
    for w in p_words:
        if w in inv_index_filtered:
            for a_idx in inv_index_filtered[w]:
                candidate_counts[a_idx] += 1
                
    # Pegar candidatos com interseção relevante
    min_overlap = max(3, int(len(p_words) * 0.35))
    candidates = [a_idx for a_idx, cnt in candidate_counts.items() if cnt >= min_overlap]
    
    best_match = None
    best_score = 0
    
    for a_idx in candidates:
        checked_pairs += 1
        a = ajuda_processed[a_idx]
        
        # Razão de tamanho antes de SequenceMatcher caro
        len_ratio = len(p['norm_stmt']) / max(1, len(a['norm_stmt']))
        if len_ratio < 0.70 or len_ratio > 1.45:
            continue
            
        stmt_sim = SequenceMatcher(None, p['norm_stmt'], a['norm_stmt']).ratio()
        if stmt_sim >= 0.85:
            # Checar similaridade de alternativas
            # 1. Comparar texto concatenado das alternativas
            opts_sim = 0
            if p['opts_joined'] and a['opts_joined']:
                opts_sim = SequenceMatcher(None, p['opts_joined'], a['opts_joined']).ratio()
            
            # 2. Se ordem das alternativas foi trocada, comparar opção por opção
            matched_opts_count = 0
            total_opts = max(len(p['opts']), len(a['opts']))
            for _, p_text in p['opts']:
                if any(SequenceMatcher(None, p_text, a_text).ratio() >= 0.85 for _, a_text in a['opts']):
                    matched_opts_count += 1
            
            opt_coverage = matched_opts_count / max(1, total_opts)
            
            # Consideramos opções > 85% se a cobertura individual ou o texto concatenado for >= 0.85
            effective_opts_sim = max(opts_sim, opt_coverage)
            
            if effective_opts_sim >= 0.85:
                # Mapear qual letra do Pending corresponde à resposta oficial do Ajuda
                ajuda_ans = a['raw'].get('officialAnswer', '').strip().upper()
                mapped_letter = None
                
                # Achar texto da resposta correta no Ajuda
                correct_text_ajuda = None
                for a_let, a_text in a['opts']:
                    if a_let == ajuda_ans:
                        correct_text_ajuda = a_text
                        break
                
                if correct_text_ajuda:
                    for p_let, p_text in p['opts']:
                        if SequenceMatcher(None, correct_text_ajuda, p_text).ratio() >= 0.85:
                            mapped_letter = p_let
                            break
                
                if not mapped_letter:
                    mapped_letter = ajuda_ans # fallback se na mesma ordem
                    
                score = (stmt_sim + effective_opts_sim) / 2.0
                if score > best_score:
                    best_score = score
                    best_match = {
                        'pending_id': p['raw']['id'],
                        'ajuda_id': a['raw']['id'],
                        'institution': p['raw'].get('institution'),
                        'year': p['raw'].get('year'),
                        'banca': p['raw'].get('banca'),
                        'stmt_similarity': round(stmt_sim, 4),
                        'opts_similarity': round(effective_opts_sim, 4),
                        'combined_similarity': round(score, 4),
                        'ajuda_official_answer': ajuda_ans,
                        'resolved_letter': mapped_letter,
                        'ajuda_explanation': (a['raw'].get('medicalExplanation') or '')[:150],
                        'pending_statement': p['raw']['statement'][:120]
                    }
                    
    if best_match and best_match['combined_similarity'] >= 0.85:
        matches.append(best_match)

print(f"\nCruzamento concluído em {time.time()-t_start:.1f}s!")
print(f"Pares avaliados: {checked_pairs}")
print(f"Total de questões resolvidas com similaridade > 85%: {len(matches)}")

with open('data/resultado_cruzamento_ajudamedico_10k.json', 'w', encoding='utf-8') as f:
    json.dump({
        'totalMatches': len(matches),
        'criterio': 'similaridade enunciado >= 85% E alternativas >= 85%',
        'matches': matches
    }, f, ensure_ascii=False, indent=2)

print("Amostra dos 5 primeiros matches:")
for m in matches[:5]:
    print(f"- [{m['institution']} - {m['year']}] Stmt: {m['stmt_similarity']*100:.1f}%, Opts: {m['opts_similarity']*100:.1f}% -> Gabarito Resolvido: {m['resolved_letter']}")
