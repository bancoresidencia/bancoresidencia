"""
Teste de Resolucao Semantica Aprofundada por Tema.
Mapeia focos satelites e Camels para as ancoras canônicas do mesmo tema.
"""

import json, os, sys, re, unicodedata
from collections import Counter, defaultdict

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = r'd:\bancoresidencia\data'
STAGING_DIR = os.path.join(DATA_DIR, 'staging')

def norm(text):
    if not text:
        return ''
    t = unicodedata.normalize('NFD', str(text))
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn').lower()
    t = re.sub(r'[^a-z0-9]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()

def split_camel_case(s):
    s1 = re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', s)
    s2 = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1 \2', s1)
    return s2.strip()

# Stopwords que nao devem ser usadas sozinhas para match
STOPWORDS = {'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 'e', 'ou', 'com', 'sem', 'para', 'por', 'sobre', 'a', 'o', 'as', 'os'}

def extract_keywords(text):
    words = norm(text).split()
    return set(w for w in words if w not in STOPWORDS and len(w) > 3)

with open(os.path.join(STAGING_DIR, 'analise_pre_fase1_focos.json'), 'r', encoding='utf-8') as f:
    analysis = json.load(f)

total_original = 0
total_mapped_to_anchor = 0
unmatched_focos = []
resulting_focos = defaultdict(set)

for esp, temas in analysis.items():
    for tema, data in temas.items():
        anchors = [a[0] for a in data.get('anchors', [])]
        # Se nao houver ancoras >= 100 questoes, pegar os top 5 mais frequentes do tema
        all_focos_sorted = sorted(data.get('camels', []) + data.get('small', []), key=lambda x: x[1], reverse=True)
        if not anchors and all_focos_sorted:
            # Selecionar os maiores focos nao-camel como ancoras
            anchors = [f[0] for f in all_focos_sorted if not re.search(r'([a-z])([A-Z])', f[0])][:5]

        # Mapeamento de ancoras e suas keywords
        anchor_kw = {anc: extract_keywords(anc) for anc in anchors}
        
        # Avaliar cada foco do tema
        # Carregar todos os focos do tema
        camels = data.get('camels', [])
        smalls = data.get('small', [])
        foco_dict = {f[0]: f[1] for f in camels + smalls}
        for a in data.get('anchors', []):
            foco_dict[a[0]] = a[1]
            
        for foco, cnt in foco_dict.items():
            total_original += 1
            # Se já é uma ancora
            if foco in anchors:
                resulting_focos[(esp, tema)].add(foco)
                continue
                
            # Tratar camel
            cleaned = split_camel_case(foco) if re.search(r'([a-z])([A-Z])', foco) else foco
            f_kw = extract_keywords(cleaned)
            
            # Tentar encontrar a melhor ancora no tema por overlap de keywords
            best_anchor = None
            max_overlap = 0
            
            for anc, akw in anchor_kw.items():
                overlap = len(f_kw.intersection(akw))
                if overlap > max_overlap:
                    max_overlap = overlap
                    best_anchor = anc
                    
            if best_anchor and max_overlap >= 1:
                total_mapped_to_anchor += 1
                resulting_focos[(esp, tema)].add(best_anchor)
            else:
                # Foco nao casou com nenhuma ancora existente no tema
                # Torna-se um foco canonico independente
                clean_title = cleaned.title()
                for p in [' Da ', ' De ', ' Do ', ' Em ', ' E ', ' Na ', ' No ', ' Dos ', ' Das ']:
                    clean_title = clean_title.replace(p, p.lower())
                resulting_focos[(esp, tema)].add(clean_title)
                unmatched_focos.append((esp, tema, foco, cnt, clean_title))

total_result = sum(len(focos) for focos in resulting_focos.values())
print(f"Total de focos originais analisados: {total_original}")
print(f"Total mapeados para ancoras existentes: {total_mapped_to_anchor}")
print(f"Total de focos canonicos resultantes: {total_result}")
print(f"Reducao: {(1 - total_result/total_original)*100:.1f}%")
print(f"Focos independentes/nao-ancorados: {len(unmatched_focos)}")

