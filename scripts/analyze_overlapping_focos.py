import json
import re
import unicodedata
from collections import defaultdict

with open('.reports/recategorizacao/censo_mestre_consolidado_259k.json', 'r', encoding='utf-8') as fp:
    censo = json.load(fp)

def norm(text):
    text = unicodedata.normalize('NFD', str(text))
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

STOPWORDS = {
    'e', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
    'a', 'o', 'as', 'os', 'com', 'para', 'por', 'sobre', 'sob', 'ou', 'se',
    'que', 'ao', 'aos', 'manejo', 'diagnostico', 'tratamento', 'conduta',
    'avaliacao', 'aspectos', 'gerais', 'clinico', 'clinica', 'protocolos',
    'prevencao', 'rastreamento', 'abordagem', 'iniciais', 'inicial'
}

def get_tokens(text):
    tokens = [t for t in norm(text).split() if len(t) >= 3 and t not in STOPWORDS]
    return set(tokens)

all_focos = []
for esp, temas in censo.items():
    for tema, focos in temas.items():
        for foco, f_data in focos.items():
            all_focos.append({
                'especialidade': esp,
                'tema': tema,
                'foco': foco,
                'norm': norm(foco),
                'tokens': get_tokens(foco),
                'total': f_data['total'],
                'subfocos_count': len(f_data['subfocos'])
            })

print(f"[INFO] Total de Focos carregados: {len(all_focos)}")

# Agrupamento por raiz clínica compartilhada
# Exemplo: identificar todas as palavras-chave clínicas e agrupá-las
keyword_to_focos = defaultdict(list)
for f in all_focos:
    for tok in f['tokens']:
        keyword_to_focos[tok].append(f)

# Pares de sobreposição
pairs = []
seen_pairs = set()

for i, f1 in enumerate(all_focos):
    for f2 in all_focos[i+1:]:
        if f1['especialidade'] != f2['especialidade']:
            continue
        
        t1, t2 = f1['tokens'], f2['tokens']
        if not t1 or not t2:
            continue
        
        inter = t1.intersection(t2)
        union = t1.union(t2)
        jaccard = len(inter) / len(union) if union else 0
        
        # Substring pura
        is_sub = (f1['norm'] in f2['norm'] or f2['norm'] in f1['norm']) and min(len(f1['norm']), len(f2['norm'])) >= 5
        
        # Se compartilham pelo menos 2 tokens significativos OU jaccard >= 0.4 OU substring com 1 token relevante
        if (len(inter) >= 2 and jaccard >= 0.3) or jaccard >= 0.5 or (is_sub and len(inter) >= 1):
            pair_key = tuple(sorted([f1['foco'], f2['foco']]))
            if pair_key not in seen_pairs:
                seen_pairs.add(pair_key)
                pairs.append({
                    'f1': f1,
                    'f2': f2,
                    'jaccard': jaccard,
                    'is_sub': is_sub,
                    'inter': list(inter),
                    'mesmo_tema': (f1['tema'] == f2['tema'])
                })

print(f"[INFO] Total de pares com intersecao detectados: {len(pairs):,}")

# Agrupamento em Clusters de Fusão
# Criar grafo de conectividade
parent = {}
def find(i):
    if parent[i] == i:
        return i
    parent[i] = find(parent[i])
    return parent[i]

def union_nodes(i, j):
    root_i = find(i)
    root_j = find(j)
    if root_i != root_j:
        parent[root_i] = root_j

for i in range(len(all_focos)):
    parent[i] = i

for p in pairs:
    # Apenas conecta se tiver alta afinidade (mesmo tema com jaccard >= 0.33 ou substring)
    if p['mesmo_tema'] and (p['jaccard'] >= 0.4 or p['is_sub'] or len(p['inter']) >= 2):
        idx1 = all_focos.index(p['f1'])
        idx2 = all_focos.index(p['f2'])
        union_nodes(idx1, idx2)

clusters = defaultdict(list)
for i, f in enumerate(all_focos):
    root = find(i)
    clusters[root].append(f)

# Clusters com mais de 1 foco (candidatos à mesclagem)
mergeable_clusters = [c for c in clusters.values() if len(c) > 1]
print(f"[INFO] Total de Clusters com Focos Candidatos a Mesclagem: {len(mergeable_clusters):,}")

total_focos_em_clusters = sum(len(c) for c in mergeable_clusters)
print(f"[INFO] Total de Focos envolvidos em clusters de sobreposicao: {total_focos_em_clusters} (de {len(all_focos)})")

# Estatísticas dos clusters
singletons = [c for c in clusters.values() if len(c) == 1]
print(f"[INFO] Focos unicos e isolados (sem sobreposicao): {len(singletons)}")
print(f"[INFO] Reducao potencial de focos se mesclados: de {len(all_focos)} para {len(clusters)} (~{len(all_focos) - len(clusters)} focos a menos)")

