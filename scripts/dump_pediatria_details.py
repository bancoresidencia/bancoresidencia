import re
import json

def clean_str(s):
    if '*(' in s:
        s = s[:s.rfind('*(')].strip()
    return s.strip().strip('"').strip('`')

with open('docs/catalogo_pediatria.md', 'r', encoding='utf-8') as f:
    text = f.read()

tema_sections = re.split(r'\n### \d+\. Tema: ', text)[1:]

with open('scripts/ped_dump.txt', 'w', encoding='utf-8') as out:
    for t_idx, sec in enumerate(tema_sections):
        lines = sec.strip().split('\n')
        raw_tema_name = lines[0].strip()
        clean_tema_name = re.sub(r'\s*\([^)]*\)', '', raw_tema_name).strip()
        
        foco_sections = re.split(r'\n#### \d+\.\d+ Foco: ', '\n'.join(lines[1:]))
        
        all_subfocos = []
        all_bullets = []
        
        for fsec in foco_sections:
            if not fsec.strip():
                continue
            flines = fsec.strip().split('\n')
            foco_name = clean_str(flines[0].strip())
            
            for l in flines[1:]:
                l_str = l.strip()
                if l_str.startswith('* **Subfoco:**'):
                    s_name = clean_str(l_str.replace('* **Subfoco:**', '').strip())
                    all_subfocos.append((foco_name, s_name))
                elif '↳' in l_str:
                    b_match = re.search(r'↳\s*`?(.*?)`?$', l_str)
                    if b_match:
                        b_text = clean_str(b_match.group(1).strip())
                        if 'Padrão-Ouro' not in b_text and len(b_text) > 3:
                            all_bullets.append(b_text)
                            
        out.write(f"\n==================================================\n")
        out.write(f"TEMA {t_idx+1}: {clean_tema_name} (Subfocos: {len(all_subfocos)}, Bullets: {len(all_bullets)})\n")
        out.write(f"==================================================\n")
        for i, (f, s) in enumerate(all_subfocos):
            out.write(f"  [{i+1}] {f} -> {s}\n")
        out.write("--- BULLETS ---\n")
        for j, b in enumerate(all_bullets):
            out.write(f"  (B{j+1}) {b}\n")

print("Pediatria dump written successfully!")

