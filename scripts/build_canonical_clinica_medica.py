import re
import json

def clean_str(s):
    if '*(' in s:
        s = s[:s.rfind('*(')].strip()
    return s.strip().strip('"').strip('`')

# Exact partition counts per tema
# Format: tema_name -> list of int (number of bullets per subfoco)
PARTITION_CONFIG = {
    'Cardiologia': [2, 4, 2, 3, 3, 2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3], # 17 subs, 48 buls
    'Pneumologia': [3, 4, 2, 2, 4, 2, 2, 2, 2, 2, 3, 2, 2, 2], # 14 subs, 34 buls
    'Gastroenterologia': [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2], # 14 subs, 27 buls
    'Nefrologia': [3, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2], # 14 subs, 31 buls
    'Endocrinologia': [3, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], # 14 subs, 31 buls
    'Reumatologia': [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2], # 14 subs, 27 buls
    'Infectologia': [4, 3, 3, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2], # 16 subs, 35 buls
    'Hematologia': [2] * 14, # 14 subs, 28 buls
    'Neurologia': [3, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], # 14 subs, 31 buls
    'Dermatologia': [2] * 12, # 12 subs, 24 buls
    'Alergia e Imunologia': [2, 2, 2, 2, 1, 2, 2, 2], # 8 subs, 15 buls
    'Oncologia Clínica': [2] * 8, # 8 subs, 16 buls
    'Medicina de Emergência': [2] * 10, # 10 subs, 20 buls
    'Geriatria': [2] * 8, # 8 subs, 16 buls
    'Cuidados Paliativos': [2, 2, 2, 2, 2, 1, 2, 2], # 8 subs, 15 buls
    'Toxicologia Clínica': [2] * 8 # 8 subs, 16 buls
}

with open('docs/catalogo_clinica_medica.md', 'r', encoding='utf-8') as f:
    text = f.read()

tema_sections = re.split(r'\n### \d+\. Tema: ', text)[1:]

temas_data = []

for t_idx, sec in enumerate(tema_sections):
    lines = sec.strip().split('\n')
    raw_tema_name = lines[0].strip()
    clean_tema_name = re.sub(r'\s*\([^)]*\)', '', raw_tema_name).strip()
    
    foco_sections = re.split(r'\n#### \d+\.\d+ Foco: ', '\n'.join(lines[1:]))
    
    focos_list = []
    
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
                
        focos_list.append({
            'foco': foco_name,
            'subfocos': subs_in_foco
        })
        
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
        'bullets': bullets
    })

# Spillover fix: Geriatria -> Emergencia
for t in temas_data:
    if t['tema'] == 'Geriatria':
        q_buls = [b for b in t['bullets'] if 'Grande Queimado' in b or 'Mioglobinúria' in b]
        t['bullets'] = [b for b in t['bullets'] if b not in q_buls]
        for t2 in temas_data:
            if t2['tema'] == 'Medicina de Emergência':
                t2['bullets'].extend(q_buls)

# Assemble final hierarchy
final_temas = []
total_subs_count = 0
total_sub_subs_count = 0

for t in temas_data:
    t_name = t['tema']
    counts = PARTITION_CONFIG[t_name]
    bullets = t['bullets']
    
    assert sum(counts) == len(bullets), f"Mismatch in {t_name}: counts sum {sum(counts)} != bullets {len(bullets)}"
    
    # Flatten subfocos list to slice bullets
    bullet_idx = 0
    t_focos_result = []
    
    for f in t['focos']:
        f_subfocos_result = []
        for s_name in f['subfocos']:
            n_b = counts[total_subs_count] if False else None # we need per-subfoco count
            # let's index properly
            total_subs_count += 1
        # we will index per tema
    
# Let's write the exact loop cleanly
total_subs_count = 0
for t in temas_data:
    t_name = t['tema']
    counts = PARTITION_CONFIG[t_name]
    bullets = t['bullets']
    
    sub_pos = 0
    bullet_idx = 0
    t_focos_result = []
    
    for f in t['focos']:
        f_subfocos_result = []
        for s_name in f['subfocos']:
            n_b = counts[sub_pos]
            s_bullets = bullets[bullet_idx : bullet_idx + n_b]
            bullet_idx += n_b
            sub_pos += 1
            total_sub_subs_count += len(s_bullets)
            total_subs_count += 1
            f_subfocos_result.append({
                'subfoco': s_name,
                'sub_subfocos': s_bullets
            })
        t_focos_result.append({
            'foco': f['foco'],
            'subfocos': f_subfocos_result
        })
        
    final_temas.append({
        'tema': t_name,
        'focos': t_focos_result
    })

print(f"Verified: {len(final_temas)} Temas, {total_subs_count} Subfocos, {total_sub_subs_count} Sub-subfocos.")

# Generate TypeScript file
ts_output = 'import { SpecialtyHierarchy } from "@/types";\n\n'
ts_output += 'export const clinicaMedicaHierarchy: SpecialtyHierarchy = {\n'
ts_output += '  "especialidade": "Clínica Médica",\n'
ts_output += '  "temas": ' + json.dumps(final_temas, ensure_ascii=False, indent=4) + '\n'
ts_output += '};\n'

with open('src/data/clinicaMedicaData.ts', 'w', encoding='utf-8') as f:
    f.write(ts_output)

print("src/data/clinicaMedicaData.ts written successfully!")
