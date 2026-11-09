import re
import json

files = [
    ('Ginecologia', 'src/data/ginecologiaData.ts', 'ginecologiaHierarchy'),
    ('Obstetrícia', 'src/data/obstetriciaData.ts', 'obstetriciaHierarchy'),
    ('Cirurgia Geral', 'src/data/cirurgiaData.ts', 'cirurgiaHierarchy'),
    ('Pediatria', 'src/data/pediatriaData.ts', 'pediatriaHierarchy'),
    ('Medicina Preventiva', 'src/data/preventivaData.ts', 'preventivaHierarchy'),
]

for name, path, export_name in files:
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    m = re.search(rf'export const {export_name}: SpecialtyHierarchy = (\{{.*\}});', text, re.DOTALL)
    if not m:
        print(f"Failed to match {export_name} in {path}")
        continue
    data = json.loads(m.group(1))
    temas = data['temas']
    total_subs = 0
    total_with_subsubs = 0
    total_overflow = 0
    padrao_ouro = len(re.findall(r'Padrão-Ouro', text))
    for t in temas:
        for f in t['focos']:
            for s in f['subfocos']:
                total_subs += 1
                ss = s.get('sub_subfocos', [])
                if len(ss) > 0:
                    total_with_subsubs += 1
                if len(ss) > 4:
                    total_overflow += 1
    print(f"\n[{name}] Total subfocos: {total_subs} | Com sub-subfocos: {total_with_subsubs} | Vazios: {total_subs - total_with_subsubs} | Overflows (>4): {total_overflow} | 'Padrão-Ouro': {padrao_ouro}")

