import re
import json

def clean_name(s):
    if '*(' in s:
        s = s[:s.rfind('*(')].strip()
    return s.strip()

def build_full_clean_clinica():
    with open('docs/catalogo_clinica_medica.md', 'r', encoding='utf-8') as f:
        text = f.read()

    tema_sections = re.split(r'\n### \d+\. Tema: ', text)[1:]
    
    clean_temas = []

    for sec in tema_sections:
        lines = sec.strip().split('\n')
        raw_tema_name = lines[0].strip()
        
        # Simplificação do nome do Tema (remover parênteses de subtítulo)
        clean_tema_name = re.sub(r'\s*\([^)]*\)', '', raw_tema_name).strip()
        
        foco_sections = re.split(r'\n#### \d+\.\d+ Foco: ', '\n'.join(lines[1:]))
        
        focos_list = []
        
        for fsec in foco_sections:
            if not fsec.strip():
                continue
            flines = fsec.strip().split('\n')
            raw_foco_name = clean_name(flines[0].strip())
            
            subfocos = []
            bullets = []
            
            for line in flines[1:]:
                l = line.strip()
                if l.startswith('* **Subfoco:**'):
                    s_raw = l.replace('* **Subfoco:**', '').strip()
                    subfocos.append(clean_name(s_raw))
                elif '↳' in l:
                    b_match = re.search(r'↳\s*`?(.*?)`?$', l)
                    if b_match:
                        b_text = b_match.group(1).strip()
                        if 'Padrão-Ouro' not in b_text and len(b_text) > 3:
                            bullets.append(clean_name(b_text))
            
            focos_list.append({
                'foco': raw_foco_name,
                'subfocos': subfocos,
                'bullets': bullets
            })
            
        blocks = []
        current_block_focos = []
        
        for f_data in focos_list:
            current_block_focos.append(f_data)
            if len(f_data['bullets']) > 0:
                blocks.append((current_block_focos, f_data['bullets']))
                current_block_focos = []
                
        if current_block_focos:
            if blocks:
                blocks[-1][0].extend(current_block_focos)
            else:
                blocks.append((current_block_focos, []))
                
        processed_focos = []
        stopwords = {'de', 'da', 'do', 'e', 'em', 'para', 'com', 'no', 'na', 'os', 'as', 'um', 'uma', 'por', 'ao', 'aos', 'ou', 'se', 'que'}
        
        for blk_focos, blk_bullets in blocks:
            all_subs = []
            for f in blk_focos:
                for s in f['subfocos']:
                    all_subs.append((f['foco'], s))
                    
            sub_bullets_map = {s: [] for f, s in all_subs}
            
            for b_idx, bullet in enumerate(blk_bullets):
                b_words = set(re.findall(r'\b[a-zá-ú]{3,}\b', bullet.lower())) - stopwords
                
                best_sub = None
                best_score = -1
                
                for s_idx, (f_name, s_name) in enumerate(all_subs):
                    s_words = set(re.findall(r'\b[a-zá-ú]{3,}\b', (f_name + " " + s_name).lower())) - stopwords
                    common = len(b_words & s_words)
                    
                    rel_b = b_idx / max(1, len(blk_bullets) - 1)
                    rel_s = s_idx / max(1, len(all_subs) - 1)
                    prox_bonus = 1.0 - abs(rel_b - rel_s) * 0.5
                    
                    score = common * 3.0 + prox_bonus
                    if score > best_score:
                        best_score = score
                        best_sub = s_name
                        
                if best_sub:
                    sub_bullets_map[best_sub].append(bullet)
                    
            for f in blk_focos:
                foco_obj = {
                    'foco': f['foco'],
                    'subfocos': []
                }
                for s in f['subfocos']:
                    assigned = sub_bullets_map.get(s, [])
                    if len(assigned) > 0:
                        foco_obj['subfocos'].append({
                            'subfoco': s,
                            'sub_subfocos': assigned
                        })
                    else:
                        foco_obj['subfocos'].append({
                            'subfoco': s
                        })
                processed_focos.append(foco_obj)
                
        clean_temas.append({
            'tema': clean_tema_name,
            'focos': processed_focos
        })

    return {
        'especialidade': 'Clínica Médica',
        'temas': clean_temas
    }

final_hierarchy = build_full_clean_clinica()

# Gerar arquivo TypeScript
ts_output = "import { SpecialtyHierarchy } from '@/types';\n\n"
ts_output += f"export const clinicaMedicaHierarchy: SpecialtyHierarchy = {json.dumps(final_hierarchy, ensure_ascii=False, indent=2)};\n"

with open('src/data/clinicaMedicaData.ts', 'w', encoding='utf-8') as f:
    f.write(ts_output)

print("SUCESSO: src/data/clinicaMedicaData.ts atualizado!")
print(f"Total Temas gerados: {len(final_hierarchy['temas'])}")
print(f"Total Focos gerados: {sum(len(t['focos']) for t in final_hierarchy['temas'])}")
print(f"Total Subfocos gerados: {sum(sum(len(f['subfocos']) for f in t['focos']) for t in final_hierarchy['temas'])}")
