import re
import json

def clean_str(s):
    if '*(' in s:
        s = s[:s.rfind('*(')].strip()
    return s.strip().strip('"').strip('`')

with open('docs/catalogo_pediatria.md', 'r', encoding='utf-8') as f:
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

stopwords = {'de', 'da', 'do', 'e', 'em', 'para', 'com', 'no', 'na', 'os', 'as', 'um', 'uma', 'por', 'ao', 'aos', 'ou', 'se', 'que', 'dos', 'das', 'pelo', 'pela', 'mais', 'menos', 'entre'}

def get_words(text):
    return set(re.findall(r'\b[a-zá-ú]{3,}\b', text.lower())) - stopwords

final_temas = []
total_subs_count = 0
total_sub_subs_count = 0

for t in temas_data:
    t_name = t['tema']
    buls = t['bullets']
    
    flat_subs = []
    for f in t['focos']:
        for s in f['subfocos']:
            flat_subs.append((f['foco'], s))
            
    N = len(buls)
    M = len(flat_subs)
    
    dp = {}
    choice = {}
    dp[(0, 0)] = 0.0
    
    for j in range(1, M + 1):
        f_name, s_name = flat_subs[j - 1]
        sw = get_words(s_name) | get_words(f_name)
        
        for i in range(1, N + 1):
            best_val = -1e9
            best_prev = -1
            min_k = 1 if N >= M else 0
            for prev_i in range(max(0, i - 4), i - min_k + 1):
                if (prev_i, j - 1) in dp:
                    seg_score = 0.0
                    for b_idx in range(prev_i, i):
                        bw = get_words(buls[b_idx])
                        common = len(bw & sw)
                        seg_score += common * 5.0
                        rel_b = b_idx / max(1, N - 1)
                        rel_s = (j - 1) / max(1, M - 1)
                        seg_score += (1.0 - abs(rel_b - rel_s)) * 2.0
                        
                    val = dp[(prev_i, j - 1)] + seg_score
                    if val > best_val:
                        best_val = val
                        best_prev = prev_i
            if best_prev != -1:
                dp[(i, j)] = best_val
                choice[(i, j)] = best_prev
                
    curr_i = N
    curr_j = M
    part = []
    while curr_j > 0:
        prev_i = choice.get((curr_i, curr_j), curr_i - 1)
        part.append((curr_j - 1, buls[prev_i:curr_i]))
        curr_i = prev_i
        curr_j -= 1
        
    part.reverse()
    assignment = {s_idx: b_list for s_idx, b_list in part}
    
    sub_pos = 0
    t_focos_result = []
    for f in t['focos']:
        f_subfocos_result = []
        for s_name in f['subfocos']:
            s_bullets = assignment.get(sub_pos, [])
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

print(f"Pediatria Verificada: {len(final_temas)} Temas, {total_subs_count} Subfocos, {total_sub_subs_count} Sub-subfocos.")

ts_output = 'import { SpecialtyHierarchy } from "@/types";\n\n'
ts_output += 'export const pediatriaHierarchy: SpecialtyHierarchy = {\n'
ts_output += '  "especialidade": "Pediatria",\n'
ts_output += '  "temas": ' + json.dumps(final_temas, ensure_ascii=False, indent=4) + '\n'
ts_output += '};\n'

with open('src/data/pediatriaData.ts', 'w', encoding='utf-8') as f:
    f.write(ts_output)

print("src/data/pediatriaData.ts written successfully!")

