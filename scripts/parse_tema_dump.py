import re
import json

with open('scripts/tema_dump.txt', 'r', encoding='utf-8') as f:
    dump_text = f.read()

tema_blocks = re.split(r'={10,}', dump_text)

all_temas_result = []

for block in tema_blocks:
    if not block.strip() or 'TEMA ' not in block:
        continue
    lines = [l.strip() for l in block.strip().split('\n') if l.strip()]
    header = lines[0] # TEMA X: Name (Subfocos: M, Bullets: N)
    m_h = re.search(r'TEMA \d+:\s*(.*?)(?:\(|$)', header)
    if not m_h:
        continue
    tema_name = m_h.group(1).strip()
    
    subs = []
    bullets = []
    
    is_bullets = False
    for l in lines[1:]:
        if l == '--- BULLETS ---':
            is_bullets = True
            continue
        if not is_bullets:
            m = re.match(r'\[\d+\]\s*(.*?)\s*->\s*(.*)', l)
            if m:
                subs.append((m.group(1).strip(), m.group(2).strip()))
        else:
            m = re.match(r'\([B\d]+\)\s*(.*)', l)
            if m:
                b_text = m.group(1).strip()
                if 'Padrão-Ouro' not in b_text and len(b_text) > 3:
                    bullets.append(b_text)
                    
    all_temas_result.append({
        'tema': tema_name,
        'subs': subs,
        'bullets': bullets
    })

# Fix cross-spillover in Geriatria -> Emergencia
for t in all_temas_result:
    if t['tema'] == 'Geriatria':
        q_buls = [b for b in t['bullets'] if 'Grande Queimado' in b or 'Mioglobinúria' in b]
        t['bullets'] = [b for b in t['bullets'] if b not in q_buls]
        for t2 in all_temas_result:
            if t2['tema'] == 'Medicina de Emergência':
                t2['bullets'].extend(q_buls)

print(f"Total parsed temas: {len(all_temas_result)}")
for t in all_temas_result:
    print(f"{t['tema']}: {len(t['subs'])} subs, {len(t['bullets'])} bullets")
