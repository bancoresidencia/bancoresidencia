import re
import json

def build_clean_clinica_medica():
    with open('docs/catalogo_clinica_medica.md', 'r', encoding='utf-8') as f:
        text = f.read()

    tema_sections = re.split(r'\n### \d+\. Tema: ', text)[1:]
    
    clean_temas = []

    for sec in tema_sections:
        lines = sec.strip().split('\n')
        raw_tema_name = lines[0].strip()
        
        # Nome limpo e simplificado
        clean_tema_name = re.sub(r'\s*\([^)]*\)', '', raw_tema_name).strip()
        
        foco_sections = re.split(r'\n#### \d+\.\d+ Foco: ', '\n'.join(lines[1:]))
        
        # Coletar todos os subfocos e onde os blocos de bullets estão
        focos_list = []
        
        for fsec in foco_sections:
            if not fsec.strip():
                continue
            flines = fsec.strip().split('\n')
            raw_foco_name = flines[0].strip()
            
            subfocos = []
            bullets = []
            
            for line in flines[1:]:
                l = line.strip()
                if l.startswith('* **Subfoco:**'):
                    sub_match = re.search(r'\* \*\*Subfoco:\*\* (.*?)(?:\s*\*\(.*?\*\)|\s*$)', l)
                    if sub_match:
                        subfocos.append(sub_match.group(1).strip())
                elif '↳' in l:
                    b_match = re.search(r'↳\s*`?(.*?)`?$', l)
                    if b_match:
                        b_text = b_match.group(1).strip()
                        if 'Padrão-Ouro' not in b_text and len(b_text) > 3:
                            bullets.append(b_text)
            
            focos_list.append({
                'foco': raw_foco_name,
                'subfocos': subfocos,
                'bullets': bullets
            })
            
        # Agora, para cada tema, os bullets aparecem em 1 ou 2 blocos.
        # Vamos dividir os focos em blocos delimitados pela presença de bullets.
        blocks = []
        current_block_focos = []
        
        for f_data in focos_list:
            current_block_focos.append(f_data)
            if len(f_data['bullets']) > 0:
                # Fim do bloco
                blocks.append((current_block_focos, f_data['bullets']))
                current_block_focos = []
                
        if current_block_focos:
            # Caso algum foco sobre sem bullets próprios
            if blocks:
                blocks[-1][0].extend(current_block_focos)
            else:
                blocks.append((current_block_focos, []))
                
        # Para cada bloco, distribuímos os bullets entre os subfocos do bloco
        processed_focos = []
        
        for blk_focos, blk_bullets in blocks:
            # Todos os subfocos desse bloco
            all_subs = []
            for f in blk_focos:
                for s in f['subfocos']:
                    all_subs.append((f['foco'], s))
                    
            # Mapeamento semântico + sequencial
            # Para cada bullet, achamos o subfoco com maior score de palavras-chave
            # Se houver empate, respeitamos a proximidade sequencial
            sub_bullets_map = {s: [] for f, s in all_subs}
            
            # Stopwords médicas comuns para não enviesar
            stopwords = {'de', 'da', 'do', 'e', 'em', 'para', 'com', 'no', 'na', 'os', 'as', 'um', 'uma', 'por', 'ao', 'aos', 'ou', 'se', 'que'}
            
            for b_idx, bullet in enumerate(blk_bullets):
                b_words = set(re.findall(r'\b[a-zá-ú]{3,}\b', bullet.lower())) - stopwords
                
                best_sub = None
                best_score = -1
                
                # Ponderar por score de palavras em comum
                for s_idx, (f_name, s_name) in enumerate(all_subs):
                    s_words = set(re.findall(r'\b[a-zá-ú]{3,}\b', (f_name + " " + s_name).lower())) - stopwords
                    common = len(b_words & s_words)
                    
                    # Bonus de proximidade sequencial relativa (bullet i proporcional a sub j)
                    rel_b = b_idx / max(1, len(blk_bullets) - 1)
                    rel_s = s_idx / max(1, len(all_subs) - 1)
                    prox_bonus = 1.0 - abs(rel_b - rel_s) * 0.5
                    
                    score = common * 3.0 + prox_bonus
                    if score > best_score:
                        best_score = score
                        best_sub = s_name
                        
                if best_sub:
                    sub_bullets_map[best_sub].append(bullet)
                    
            # Reconstruir os focos com seus subfocos
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
                        # Subfoco sem sub_subfoco (fica limpo)
                        foco_obj['subfocos'].append({
                            'subfoco': s
                        })
                processed_focos.append(foco_obj)
                
        clean_temas.append({
            'tema': clean_tema_name,
            'focos': processed_focos
        })

    return clean_temas

temas = build_clean_clinica_medica()

# Checar auditoria
print("=== AUDITORIA DO MAPEAMENTO ===")
total_subs_com_subsub = 0
total_subs_sem_subsub = 0
max_itens = 0
max_sub = ""

for t in temas:
    print(f"\n[TEMA] {t['tema']}")
    for f in t['focos']:
        for s in f['subfocos']:
            subs = s.get('sub_subfocos', [])
            count = len(subs)
            if count > 0:
                total_subs_com_subsub += 1
                if count > max_itens:
                    max_itens = count
                    max_sub = s['subfoco']
                print(f"   [COM SUB-SUB] {s['subfoco']} -> {count} itens")
            else:
                total_subs_sem_subsub += 1
                print(f"   [SEM SUB-SUB] {s['subfoco']}")

print(f"\n==========================================")
print(f"Total Subfocos COM sub-subfoco: {total_subs_com_subsub}")
print(f"Total Subfocos SEM sub-subfoco: {total_subs_sem_subsub}")
print(f"Maior quantidade de itens em um único subfoco: {max_itens} (em '{max_sub}')")
print(f"==========================================")
