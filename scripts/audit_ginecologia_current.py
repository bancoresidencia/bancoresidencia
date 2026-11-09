import re
import json

with open('src/data/ginecologiaData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'export const ginecologiaHierarchy: SpecialtyHierarchy = (\{.*\});', text, re.DOTALL)
if m:
    data = json.loads(m.group(1))
    temas = data['temas']
    print(f"Total Temas em Ginecologia: {len(temas)}")
    
    for t_idx, t in enumerate(temas):
        t_name = t['tema']
        n_subs = 0
        n_with_subsubs = 0
        overflow_subs = []
        for f in t['focos']:
            for s in f['subfocos']:
                n_subs += 1
                ss = s.get('sub_subfocos', [])
                if len(ss) > 0:
                    n_with_subsubs += 1
                if len(ss) > 4:
                    overflow_subs.append((s['subfoco'], len(ss)))
        print(f"Tema {t_idx+1}: {t_name} | {n_subs} subfocos | {n_with_subsubs} com sub-subfocos | Overflows (>4): {overflow_subs}")
else:
    print("Could not match ginecologiaHierarchy")

