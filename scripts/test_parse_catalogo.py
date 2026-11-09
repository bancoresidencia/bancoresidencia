import re
import json

def parse_catalogo_clinica():
    with open('docs/catalogo_clinica_medica.md', 'r', encoding='utf-8') as f:
        text = f.read()

    # Split into Temas: '### <num>. Tema: <Nome>'
    tema_sections = re.split(r'\n### \d+\. Tema: ', text)[1:]
    
    clean_temas = []

    for sec in tema_sections:
        lines = sec.strip().split('\n')
        raw_tema_name = lines[0].strip()
        
        # Simplificação do nome do Tema (remover parênteses de subtítulo, mas manter se essencial)
        clean_tema_name = re.sub(r'\s*\([^)]*\)', '', raw_tema_name).strip()
        
        # Focos são marcados por '#### <num>.<num> Foco: <Nome>'
        foco_sections = re.split(r'\n#### \d+\.\d+ Foco: ', '\n'.join(lines[1:]))
        
        temas_focos = []
        
        for fsec in foco_sections:
            if not fsec.strip():
                continue
            flines = fsec.strip().split('\n')
            raw_foco_name = flines[0].strip()
            
            # Subfocos são marcados por '* **Subfoco:** <Nome> *(...)*'
            # Bullets são marcados por '* ↳ `<texto>`' ou '* ↳ <texto>'
            subfocos_raw = []
            bullets_raw = []
            
            for line in flines[1:]:
                l = line.strip()
                if l.startswith('* **Subfoco:**'):
                    # Extrair nome do subfoco sem o '(X questões estimadas)'
                    sub_match = re.search(r'\* \*\*Subfoco:\*\* (.*?)(?:\s*\*\(.*?\*\)|\s*$)', l)
                    if sub_match:
                        subfocos_raw.append(sub_match.group(1).strip())
                elif '↳' in l:
                    # Extrair texto do bullet
                    b_match = re.search(r'↳\s*`?(.*?)`?$', l)
                    if b_match:
                        b_text = b_match.group(1).strip()
                        if 'Padrão-Ouro' not in b_text and len(b_text) > 3:
                            bullets_raw.append(b_text)
            
            temas_focos.append({
                'foco': raw_foco_name,
                'subfocos_raw': subfocos_raw,
                'bullets_raw': bullets_raw
            })
            
        clean_temas.append({
            'tema': clean_tema_name,
            'focos_data': temas_focos
        })

    return clean_temas

temas = parse_catalogo_clinica()
print(f"Total temas parseados: {len(temas)}")
for t in temas:
    total_subs = sum(len(f['subfocos_raw']) for f in t['focos_data'])
    total_bullets = sum(len(f['bullets_raw']) for f in t['focos_data'])
    print(f"- {t['tema']}: {len(t['focos_data'])} Focos | {total_subs} Subfocos | {total_bullets} Bullets")
