import re
import json

def clean_str(s):
    if '*(' in s:
        s = s[:s.rfind('*(')].strip()
    return s.strip().strip('"').strip('`')

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

# Fix cross-spillover in Geriatria -> Emergencia
for t in temas_data:
    if t['tema'] == 'Geriatria':
        queimados_bullets = [b for b in t['bullets'] if 'Grande Queimado' in b or 'Mioglobinúria' in b]
        t['bullets'] = [b for b in t['bullets'] if b not in queimados_bullets]
        for t2 in temas_data:
            if t2['tema'] == 'Medicina de Emergência':
                t2['bullets'].extend(queimados_bullets)

print("Checking bullet-to-subfoco sequential correspondence:")

stopwords = {'de', 'da', 'do', 'e', 'em', 'para', 'com', 'no', 'na', 'os', 'as', 'um', 'uma', 'por', 'ao', 'aos', 'ou', 'se', 'que', 'dos', 'das', 'pelo', 'pela', 'mais', 'menos', 'entre'}

def get_words(text):
    return set(re.findall(r'\b[a-zá-ú]{3,}\b', text.lower())) - stopwords

for t in temas_data:
    subs = t['subfocos_flat']
    buls = t['bullets']
    N = len(buls)
    M = len(subs)
    
    dp = {}
    choice = {}
    dp[(0, 0)] = 0.0
    
    for j in range(1, M + 1):
        f_name, s_name = subs[j - 1]
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
    t['partition'] = part

with open('scripts/partition_audit.txt', 'w', encoding='utf-8') as out:
    for t in temas_data:
        out.write(f"\n=======================================================\n")
        out.write(f"TEMA: {t['tema']} ({len(t['subfocos_flat'])} subfocos, {len(t['bullets'])} bullets)\n")
        out.write(f"=======================================================\n")
        for s_idx, b_list in t['partition']:
            f_name, s_name = t['subfocos_flat'][s_idx]
            out.write(f"\n[{f_name}] -> {s_name} ({len(b_list)} sub-subfocos):\n")
            for b in b_list:
                out.write(f"   * {b}\n")

print("Partition audit written to scripts/partition_audit.txt successfully!")
