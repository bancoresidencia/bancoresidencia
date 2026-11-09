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

# Fix cross-tema spillover: In Tema 14 (Geriatria), the first 2 bullets are actually for Tema 13 (Medicina de Emergência) last subfoco!
for t in temas_data:
    if t['tema'] == 'Geriatria':
        queimados_bullets = [b for b in t['bullets'] if 'Grande Queimado' in b or 'Mioglobinúria' in b]
        t['bullets'] = [b for b in t['bullets'] if b not in queimados_bullets]
        for t_prev in temas_data:
            if t_prev['tema'] == 'Medicina de Emergência':
                t_prev['bullets'].extend(queimados_bullets)

# Monotonic alignment with DP
# We want to assign each bullet b in 0..N-1 to a subfoco s in 0..M-1 such that:
# - alignment is non-decreasing (if b_i -> s_k, then b_{i+1} -> s_j with j >= k)
# - each subfoco gets at least 1 bullet (or min_per_sub) and at most max_per_sub
# - maximize similarity between bullet and subfoco

stopwords = {'de', 'da', 'do', 'e', 'em', 'para', 'com', 'no', 'na', 'os', 'as', 'um', 'uma', 'por', 'ao', 'aos', 'ou', 'se', 'que', 'dos', 'das', 'pelo', 'pela', 'mais', 'menos', 'entre'}

def get_words(text):
    return set(re.findall(r'\b[a-zá-ú]{3,}\b', text.lower())) - stopwords

def sim(b_text, s_name, f_name):
    bw = get_words(b_text)
    sw = get_words(s_name)
    fw = get_words(f_name)
    target = sw | fw
    common = len(bw & target)
    # bonus for exact acronym or exact word match in subfoco
    acronyms = re.findall(r'\b[A-Z]{2,}\b', s_name)
    for ac in acronyms:
        if ac.lower() in bw:
            common += 3
    return common

# Align each tema
for t in temas_data:
    subs = t['subfocos_flat']
    bullets = t['bullets']
    N = len(bullets)
    M = len(subs)
    
    # DP state: dp[b_idx][s_idx] = max score of assigning bullets 0..b_idx to subfocos ending at s_idx
    # with constraint that s_idx is non-decreasing and each subfoco gets between 1 and 4 bullets (or 0 if M > N)
    # Given N >= M in almost all cases:
    # Let's enforce that every subfoco gets >= 1 bullet when N >= M.
    
    # We can use DP: dp(i, j) where i is bullet index, j is subfoco index.
    # To keep it very clean and strict, let's solve with DP:
    # dp[i][j] = best score of assigning first i bullets (0..i-1) to first j subfocos (0..j-1)
    # transitions: dp[i][j] = max_{1 <= k <= 4} (dp[i-k][j-1] + sum(sim(bullets[i-k..i-1], subfoco[j-1])))
    
    dp = {}
    parent = {}
    
    dp[(0, 0)] = 0.0
    
    for j in range(1, M + 1):
        f_name, s_name = subs[j - 1]
        for i in range(1, N + 1):
            best_val = -1e9
            best_k = -1
            # k is number of bullets assigned to subfoco j-1
            # allowed k: 1 to 5 (or if N < M, 0 to 5)
            min_k = 1 if N >= M else 0
            max_k = 5
            for k in range(min_k, max_k + 1):
                if i - k >= 0 and (i - k, j - 1) in dp:
                    # calculate score of assigning bullets[i-k .. i-1] to subfoco j-1
                    b_score = 0.0
                    for b_pos in range(i - k, i):
                        b_score += sim(bullets[b_pos], s_name, f_name)
                        # small penalty if bullet is far from expected proportional position
                        rel_b = b_pos / max(1, N - 1)
                        rel_s = (j - 1) / max(1, M - 1)
                        b_score += 1.0 - abs(rel_b - rel_s) * 0.5
                    
                    val = dp[(i - k, j - 1)] + b_score
                    if val > best_val:
                        best_val = val
                        best_k = k
            if best_k != -1:
                dp[(i, j)] = best_val
                parent[(i, j)] = best_k

    # Backtrack
    curr_i = N
    curr_j = M
    assignment = {}
    while curr_j > 0:
        k = parent.get((curr_i, curr_j), 1)
        sub_bullets = bullets[curr_i - k : curr_i]
        assignment[curr_j - 1] = sub_bullets
        curr_i -= k
        curr_j -= 1
        
    t['assignment'] = assignment

# Print sample results for Tema 1 (Cardio) and Tema 6 (Reuma) and Tema 9 (Neuro)
for t_idx in [0, 5, 8]:
    t = temas_data[t_idx]
    print(f"\n=======================================================")
    print(f"TEMA: {t['tema']}")
    print(f"=======================================================")
    for s_idx, (f, s) in enumerate(t['subfocos_flat']):
        b_list = t['assignment'].get(s_idx, [])
        print(f"\n[{f}] -> {s} ({len(b_list)} sub-subfocos):")
        for b in b_list:
            print(f"   * {b[:90]}...")
