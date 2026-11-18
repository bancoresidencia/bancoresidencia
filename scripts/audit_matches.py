import json
import re

with open('data/knowledge/public_domain_medical_images.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

with open('src/data/clinicalTipsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

prefix = 'export const CLINICAL_TIPS_DATABASE: ClinicalTipItem[] = '
start_idx = text.find(prefix) + len(prefix)
end_idx = text.rfind('];') + 1

cards = json.loads(text[start_idx:end_idx])

def normalize(txt):
    if not txt:
        return ""
    txt = txt.lower()
    mapping = {'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'é': 'e', 'ê': 'e', 'í': 'i', 'ó': 'o', 'õ': 'o', 'ô': 'o', 'ú': 'u', 'ç': 'c'}
    for k, v in mapping.items():
        txt = txt.replace(k, v)
    return txt

incongruous = []
all_matched = []

for c in cards:
    cid = c.get('id')
    spec = c.get('specialty')
    tema = c.get('tema')
    foco = c.get('foco', '')
    title = c.get('title')
    img = c.get('imageUrl')
    
    card_text = normalize(f"{spec} {tema} {foco} {title}")
    
    for key, p_img in catalog.items():
        for m in p_img.get('matches', []):
            m_norm = normalize(m)
            # Verifica a lógica antiga: m in card_text or card_text in m
            if m_norm in card_text or card_text in m_norm:
                all_matched.append({
                    'id': cid,
                    'title': title,
                    'spec': spec,
                    'tema': tema,
                    'foco': foco,
                    'matched_key': key,
                    'matched_term': m,
                    'img_url': p_img['imageUrl'],
                    'modality': p_img['imageModality'],
                    'caption': p_img['imageCaption']
                })
                break

print(f"Total de matches gerados pela logica antiga: {len(all_matched)}")
for item in all_matched:
    print(f"[{item['spec']}] '{item['title']}' --> matched: '{item['matched_term']}' (Img: {item['matched_key']})")
