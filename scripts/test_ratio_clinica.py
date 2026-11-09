import re
import json

def clean_str(s):
    if '*(' in s:
        s = s[:s.rfind('*(')].strip()
    return s.strip().strip('"').strip('`')

# We will read docs/catalogo_clinica_medica.md
with open('docs/catalogo_clinica_medica.md', 'r', encoding='utf-8') as f:
    text = f.read()

tema_sections = re.split(r'\n### \d+\. Tema: ', text)[1:]

# We'll map each tema
temas_data = []

for t_idx, sec in enumerate(tema_sections):
    lines = sec.strip().split('\n')
    raw_tema_name = lines[0].strip()
    clean_tema_name = re.sub(r'\s*\([^)]*\)', '', raw_tema_name).strip()
    
    foco_sections = re.split(r'\n#### \d+\.\d+ Foco: ', '\n'.join(lines[1:]))
    
    focos_list = []
    all_subfocos_flat = []
    
    for fsec in foco_sections:
        if not fsec.strip():
            continue
        flines = fsec.strip().split('\n')
        foco_name = clean_str(flines[0].strip())
        
        subs_in_foco = []
        for l in flines[1:]:
            l_str = l.strip()
            if l_str.startswith('* **Subfoco:**'):
                s_name = clean_str(l_str.replace('* **Subfoco:**', '').strip())
                subs_in_foco.append(s_name)
                all_subfocos_flat.append((foco_name, s_name))
                
        focos_list.append({
            'foco': foco_name,
            'subfocos': subs_in_foco
        })
        
    # extract all bullets in this tema section
    bullets = []
    for l in sec.split('\n'):
        l_str = l.strip()
        if '↳' in l_str:
            b_match = re.search(r'↳\s*`?(.*?)`?$', l_str)
            if b_match:
                b_text = clean_str(b_match.group(1).strip())
                if 'Padrão-Ouro' not in b_text and len(b_text) > 3:
                    bullets.append(b_text)
                    
    temas_data.append({
        'tema': clean_tema_name,
        'focos': focos_list,
        'subfocos_flat': all_subfocos_flat,
        'bullets': bullets
    })

print(f"Loaded {len(temas_data)} temas.")

# Fix cross-tema spillover: In Tema 14 (Geriatria), the first 2 bullets are actually for Tema 13 (Medicina de Emergência) last subfoco!
for t in temas_data:
    if t['tema'] == 'Geriatria':
        queimados_bullets = [b for b in t['bullets'] if 'Grande Queimado' in b or 'Mioglobinúria' in b]
        t['bullets'] = [b for b in t['bullets'] if b not in queimados_bullets]
        # give them to Medicina de Emergência
        for t_prev in temas_data:
            if t_prev['tema'] == 'Medicina de Emergência':
                t_prev['bullets'].extend(queimados_bullets)

print("\n--- Summary per Tema ---")
for t in temas_data:
    n_subs = len(t['subfocos_flat'])
    n_bul = len(t['bullets'])
    print(f"{t['tema']}: {n_subs} subfocos, {n_bul} bullets (ratio: {n_bul/n_subs:.2f})")
