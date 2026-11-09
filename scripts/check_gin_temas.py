import re

with open('docs/catalogo_ginecologia.md', 'r', encoding='utf-8') as f:
    text = f.read()

temas = re.split(r'\n### \d+\. Tema: ', text)[1:]

for t_idx, sec in enumerate(temas):
    lines = sec.strip().split('\n')
    raw_tema_name = lines[0].strip()
    clean_tema_name = re.sub(r'\s*\([^)]*\)', '', raw_tema_name).strip()
    
    focos = re.split(r'\n#### \d+\.\d+ Foco: ', '\n'.join(lines[1:]))
    all_subs = []
    for fsec in focos:
        if not fsec.strip(): continue
        flines = fsec.strip().split('\n')
        foco_name = flines[0].strip()
        for l in flines[1:]:
            if l.strip().startswith('* **Subfoco:**'):
                all_subs.append(l.strip().replace('* **Subfoco:**', '').strip())
                
    bullets = [b for b in re.findall(r'↳\s*`?(.*?)`?$', sec, re.MULTILINE) if 'Padrão-Ouro' not in b and len(b.strip()) > 3]
    
    print(f"Tema {t_idx+1}: {clean_tema_name} | Subfocos: {len(all_subs)} | Bullets: {len(bullets)}")

