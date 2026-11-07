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

def split_camel_case(s):
    # Separa CamelCase para palavras: AbdomeAgudo -> Abdome Agudo
    s = re.sub(r'([a-z])([A-Z])', r'\1 \2', s)
    s = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1 \2', s)
    return s

STOPWORDS = {
    'e', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
    'a', 'o', 'as', 'os', 'com', 'para', 'por', 'sobre', 'sob', 'ou', 'se',
    'que', 'ao', 'aos', 'manejo', 'diagnostico', 'tratamento', 'conduta',
    'avaliacao', 'aspectos', 'gerais', 'clinico', 'clinica', 'protocolos',
    'prevencao', 'rastreamento', 'abordagem', 'iniciais', 'inicial', 'sindrome',
    'doenca', 'doencas', 'agudo', 'aguda', 'cronico', 'cronica'
}

def extract_core_keywords(text):
    expanded = split_camel_case(text)
    words = norm(expanded).split()
    return set(w for w in words if len(w) >= 4 and w not in STOPWORDS)

# Estruturar todos os focos
all_focos = []
by_esp_tema = defaultdict(lambda: defaultdict(list))

for esp, temas in censo.items():
    for tema, focos in temas.items():
        for foco, f_data in focos.items():
            item = {
                'especialidade': esp,
                'tema': tema,
                'foco': foco,
                'total': f_data['total'],
                'subfocos_count': len(f_data['subfocos']),
                'subfocos_list': list(f_data['subfocos'].keys())[:5],
                'is_camel': bool(re.search(r'[a-z][A-Z]', foco)),
                'expanded': split_camel_case(foco),
                'norm': norm(split_camel_case(foco)),
                'core_keys': extract_core_keywords(foco)
            }
            all_focos.append(item)
            by_esp_tema[esp][tema].append(item)

print(f"[INFO] Focos mapeados: {len(all_focos)}")

# Mapear interseções dentro de cada tema
intersections_by_tema = []

for esp, temas in by_esp_tema.items():
    for tema, f_list in temas.items():
        if len(f_list) <= 1:
            continue
        
        # Encontrar pares com sobreposição semântica
        tema_pairs = []
        for i in range(len(f_list)):
            for j in range(i + 1, len(f_list)):
                fa = f_list[i]
                fb = f_list[j]
                
                # Critério 1: CamelCase de um foco coincide com o outro
                # Critério 2: Compartilham palavras-chave clínicas nucleares
                # Critério 3: Substring significativa
                common_keys = fa['core_keys'].intersection(fb['core_keys'])
                norm_a, norm_b = fa['norm'], fb['norm']
                
                is_sub = (norm_a in norm_b or norm_b in norm_a) and min(len(norm_a), len(norm_b)) >= 6
                
                sim_score = 0
                match_type = []
                
                if fa['is_camel'] or fb['is_camel']:
                    if is_sub or len(common_keys) >= 1:
                        sim_score += 0.8
                        match_type.append('CamelCase vs Canônico')
                
                if len(common_keys) >= 2:
                    sim_score += 0.7
                    match_type.append(f'Termos Centrais ({", ".join(common_keys)})')
                elif len(common_keys) == 1 and is_sub:
                    sim_score += 0.6
                    match_type.append(f'Núcleo + Substring ({list(common_keys)[0]})')
                elif is_sub and min(len(norm_a), len(norm_b)) >= 8:
                    sim_score += 0.5
                    match_type.append('Substring Estrita')

                if sim_score >= 0.5:
                    tema_pairs.append({
                        'foco_a': fa,
                        'foco_b': fb,
                        'score': sim_score,
                        'common_keys': list(common_keys),
                        'types': match_type
                    })
        
        if tema_pairs:
            intersections_by_tema.append({
                'especialidade': esp,
                'tema': tema,
                'total_focos': len(f_list),
                'pairs': tema_pairs
            })

print(f"[INFO] Total de temas com interseções de focos detectadas: {len(intersections_by_tema)}")
total_pairs_found = sum(len(t['pairs']) for t in intersections_by_tema)
print(f"[INFO] Total de pares de focos com alta interseção: {total_pairs_found}")

# Estatística de Focos CamelCase / Legados
camel_focos = [f for f in all_focos if f['is_camel']]
print(f"[INFO] Focos em notação CamelCase/Aglutinada: {len(camel_focos)} focos ({sum(f['total'] for f in camel_focos):,} questões)")

# Gerar arquivo de auditoria em staging
report_data = {
    'total_focos': len(all_focos),
    'focos_camelcase_count': len(camel_focos),
    'focos_camelcase_questoes': sum(f['total'] for f in camel_focos),
    'temas_com_intersecoes': len(intersections_by_tema),
    'total_pares_intersecao': total_pairs_found,
    'detalhes_por_tema': []
}

for t in intersections_by_tema:
    tema_entry = {
        'especialidade': t['especialidade'],
        'tema': t['tema'],
        'total_focos_no_tema': t['total_focos'],
        'qtd_pares': len(t['pairs']),
        'pares': []
    }
    for p in t['pairs']:
        tema_entry['pares'].append({
            'foco_maior': p['foco_a']['foco'] if p['foco_a']['total'] >= p['foco_b']['total'] else p['foco_b']['foco'],
            'total_maior': max(p['foco_a']['total'], p['foco_b']['total']),
            'foco_menor': p['foco_b']['foco'] if p['foco_a']['total'] >= p['foco_b']['total'] else p['foco_a']['foco'],
            'total_menor': min(p['foco_a']['total'], p['foco_b']['total']),
            'score': p['score'],
            'tipologia': p['types'],
            'termos_comuns': p['common_keys']
        })
    report_data['detalhes_por_tema'].append(tema_entry)

with open('data/staging/auditoria_intersecoes_focos.json', 'w', encoding='utf-8') as fp:
    json.dump(report_data, fp, ensure_ascii=False, indent=2)

print("[OK] Arquivo salvo: data/staging/auditoria_intersecoes_focos.json")

