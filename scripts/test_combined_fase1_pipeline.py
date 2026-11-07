"""
Teste de Pipeline Combinado:
Regras Clinicas + Semantic Anchor Matching por Tema + Promocao de Subfoco.
"""

import json, os, sys, re, unicodedata
from collections import Counter, defaultdict

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = r'd:\bancoresidencia\data'
STAGING_DIR = os.path.join(DATA_DIR, 'staging')

from generate_full_fase1_canonical_matrix import CLINICAL_RULES, norm, split_camel_case

# Carregar analise de focos para obter ancoras por tema
with open(os.path.join(STAGING_DIR, 'analise_pre_fase1_focos.json'), 'r', encoding='utf-8') as f:
    analysis = json.load(f)

# Coletar ancoras por tema (focos >= 50 questoes)
theme_anchors = defaultdict(lambda: defaultdict(list))
STOPWORDS = {'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 'e', 'ou', 'com', 'sem', 'para', 'por', 'sobre', 'a', 'o', 'as', 'os'}

def extract_kw(text):
    words = norm(text).split()
    return set(w for w in words if w not in STOPWORDS and len(w) > 3)

for esp, temas in analysis.items():
    for tema, data in temas.items():
        anchors = [a[0] for a in data.get('anchors', [])]
        if not anchors:
            all_sorted = sorted(data.get('camels', []) + data.get('small', []), key=lambda x: x[1], reverse=True)
            anchors = [f[0] for f in all_sorted if not re.search(r'([a-z])([A-Z])', f[0])][:8]
        theme_anchors[esp][tema] = [(anc, extract_kw(anc)) for anc in anchors]

# Carregar mapa atual gerado pela fase 1
with open(os.path.join(STAGING_DIR, 'mapa_mesclagem_focos_canonica.json'), 'r', encoding='utf-8') as f:
    current_map = json.load(f)['mapa']

combined_dest_focos = set()
rule_counter = Counter()

for key, entry in current_map.items():
    esp = entry['origem']['especialidade']
    tema = entry['origem']['tema']
    orig_foco = entry['origem']['foco']
    current_dest = entry['destino']['foco_canonico']
    current_rule = entry['regra']
    
    if current_rule == 'REGRA_CLINICA_CANONICA':
        final_dest = current_dest
        final_rule = current_rule
    else:
        # Tentar casar com as ancoras do tema
        anchors = theme_anchors[esp][tema]
        f_kw = extract_kw(current_dest)
        best_anc = None
        max_overlap = 0
        for anc, akw in anchors:
            overlap = len(f_kw.intersection(akw))
            if overlap > max_overlap:
                max_overlap = overlap
                best_anc = anc
                
        if best_anc and max_overlap >= 1:
            final_dest = best_anc
            final_rule = "SUBSUNCAO_ANCORA_TEMA"
        else:
            final_dest = current_dest
            final_rule = current_rule
            
    combined_dest_focos.add((esp, tema, final_dest))
    rule_counter[final_rule] += 1

total_orig = len(current_map)
total_res = len(combined_dest_focos)
print(f"Total de focos originais: {total_orig}")
print(f"Total de focos canonicos combinados: {total_res}")
print(f"Reducao de redundancia: {(1 - total_res/total_orig)*100:.1f}%")
print("\nRegras:")
for r, c in rule_counter.most_common():
    print(f"  {r}: {c} ({c/total_orig*100:.1f}%)")

dest_by_esp = Counter(esp for esp, tema, foco in combined_dest_focos)
print("\nFocos por Especialidade:")
for esp, cnt in dest_by_esp.most_common():
    print(f"  {esp}: {cnt}")

