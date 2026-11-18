import json

with open('data/resultado_cruzamento_ajudamedico_10k.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

matches = data['matches']
target_matches = [m for m in matches if 0.85 <= m['combined_similarity'] < 0.90]

print(f"Total na faixa 85-89.9%: {len(target_matches)}")
if target_matches:
    m = target_matches[0]
    print(json.dumps(m, ensure_ascii=False, indent=2))
    
    # Pegar os dados completos do Pending e do Ajuda
    with open('data/pending_10k_live.json', 'r', encoding='utf-8') as f:
        pending = json.load(f)
    with open('data/knowledge/ajudamedico_consolidado_9223.json', 'r', encoding='utf-8') as f:
        ajuda = json.load(f)['questoes']
        
    p_full = next((p for p in pending if p['id'] == m['pending_id']), None)
    a_full = next((a for a in ajuda if a['id'] == m['ajuda_id']), None)
    
    with open('data/questao_85_89.json', 'w', encoding='utf-8') as f:
        json.dump({'match': m, 'pending_full': p_full, 'ajuda_full': a_full}, f, ensure_ascii=False, indent=2)
