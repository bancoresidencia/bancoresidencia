import re
import json

def clean_str(s):
    if '*(' in s:
        s = s[:s.rfind('*(')].strip()
    return s.strip().strip('"').strip('`')

PARTITION_CONFIG_OBS = {
    'Assistência Pré-Natal e Fisiologia Gestacional': [3, 3, 2, 2, 3, 2, 2, 2, 2, 2], # 10 subs, 23 buls
    'Hemorragias da Primeira Metade da Gravidez': [6, 3, 3, 2, 3, 3, 3, 3], # 8 subs, 26 buls
    'Hemorragias da Segunda Metade da Gravidez': [3, 3, 3, 3, 4, 2, 3, 3, 3, 2], # 10 subs, 29 buls
    'Síndromes Hipertensivas na Gravidez': [2, 3, 2, 3, 3, 2, 2, 2, 2, 1], # 10 subs, 22 buls
    'Diabetes Gestacional e Endocrinopatias': [3, 3, 3, 2, 2, 2], # 6 subs, 15 buls (or 17, let's verify)
    'Infecções Congênitas e Perinatais': [3, 2, 3, 4, 3, 2, 2, 2, 2, 2, 2, 2], # 12 subs, 29 buls
    'Mecanismo de Parto, Partograma e Distócias': [4, 2, 4, 2, 5, 2, 2, 2, 2, 4, 2, 2, 2, 2], # 14 subs, 37 buls
    'Puerpério e Hemorragia Pós-Parto (HPP)': [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1], # 12 subs, 23 buls
    'Avaliação da Vitalidade Fetal': [4, 4, 2, 2, 3, 2, 4, 1, 2, 1], # 10 subs, 25 buls
    'Prematuridade e Amniorrexe Prematura': [3, 4, 2, 3, 2, 2, 2, 2], # 8 subs, 20 buls
    'Gestação Múltipla': [3, 3, 2, 1, 1, 2] # 6 subs, 12 buls
}

with open('docs/catalogo_obstetricia.md', 'r', encoding='utf-8') as f:
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

# Move 2 spilled bullets from Tema 10 (Prematuridade) to Tema 9 (Vitalidade Fetal)
t9 = next(t for t in temas_data if 'Vitalidade' in t['tema'])
t10 = next(t for t in temas_data if 'Prematuridade' in t['tema'])
oligo_poly_bullets = [b for b in t10['bullets'] if 'Oligoidrâmnio:' in b or 'Polidrâmnio:' in b]
t10['bullets'] = [b for b in t10['bullets'] if b not in oligo_poly_bullets]
t9['bullets'].extend(oligo_poly_bullets)

# In Tema 5 (Diabetes Gestacional), check bullets count
t5 = next(t for t in temas_data if 'Diabetes Gestacional' in t['tema'])
# If t5 has 17 bullets, adjust partition
if len(t5['bullets']) == 17:
    PARTITION_CONFIG_OBS['Diabetes Gestacional e Endocrinopatias'] = [3, 3, 3, 2, 3, 3]

# In Tema 8 (Puerperio), check name and bullets
t8 = next(t for t in temas_data if 'Puerpério' in t['tema'])

# Build hierarchy
final_temas = []
total_subs_count = 0
total_sub_subs_count = 0

for t in temas_data:
    t_name = t['tema']
    # Match config key
    cfg_key = next((k for k in PARTITION_CONFIG_OBS if k.split('(')[0].strip() == t_name.split('(')[0].strip()), None)
    assert cfg_key, f"No config key found for {t_name}"
    counts = PARTITION_CONFIG_OBS[cfg_key]
    bullets = t['bullets']
    
    assert sum(counts) == len(bullets), f"Mismatch in {t_name}: counts sum {sum(counts)} != bullets {len(bullets)}"
    
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

print(f"Obstetrícia Verificada: {len(final_temas)} Temas, {total_subs_count} Subfocos, {total_sub_subs_count} Sub-subfocos.")

# Generate TypeScript file for Obstetrícia
ts_output = 'import { SpecialtyHierarchy } from "@/types";\n\n'
ts_output += 'export const obstetriciaHierarchy: SpecialtyHierarchy = {\n'
ts_output += '  "especialidade": "Obstetrícia",\n'
ts_output += '  "temas": ' + json.dumps(final_temas, ensure_ascii=False, indent=4) + '\n'
ts_output += '};\n'

with open('src/data/obstetriciaData.ts', 'w', encoding='utf-8') as f:
    f.write(ts_output)

print("src/data/obstetriciaData.ts written successfully!")

