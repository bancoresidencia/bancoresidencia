import json
import re

files = [
    ('Clínica Médica', 'src/data/clinicaMedicaData.ts'),
    ('Ginecologia', 'src/data/ginecologiaData.ts'),
    ('Obstetrícia', 'src/data/obstetriciaData.ts'),
    ('Cirurgia Geral', 'src/data/cirurgiaData.ts'),
    ('Pediatria', 'src/data/pediatriaData.ts'),
    ('Medicina Preventiva', 'src/data/preventivaData.ts')
]

overall_stats = []
has_errors = False

for label, path in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    m = re.search(r'=\s*(\{.*\});?\s*$', content, re.DOTALL)
    if not m:
        print(f"ERROR: Could not parse JSON from {path}")
        has_errors = True
        continue
    
    data = json.loads(m.group(1))
    
    temas = data.get('temas', [])
    total_focos = sum(len(t.get('focos', [])) for t in temas)
    
    subfocos_list = []
    for t in temas:
        for f in t.get('focos', []):
            for s in f.get('subfocos', []):
                subfocos_list.append((t.get('tema'), f.get('foco'), s.get('subfoco'), s.get('sub_subfocos', [])))
                
    total_subfocos = len(subfocos_list)
    total_ss = sum(len(s[3]) for s in subfocos_list)
    empty = [s for s in subfocos_list if len(s[3]) == 0]
    overflow = [s for s in subfocos_list if len(s[3]) > 6]
    
    padrao_ouro_count = len(re.findall(r'Padrão-Ouro de Preparação Médica', content))
    estimadas_count = len(re.findall(r'questões estimadas', content))
    
    print(f"\n==========================================")
    print(f"SPECIALTY: {label}")
    print(f"  - Temas: {len(temas)}")
    print(f"  - Focos: {total_focos}")
    print(f"  - Subfocos: {total_subfocos}")
    print(f"  - Sub-subfocos (4º Nível): {total_ss}")
    print(f"  - Média por subfoco: {total_ss / total_subfocos:.2f}")
    print(f"  - Subfocos vazios: {len(empty)}")
    print(f"  - Subfocos com > 6 itens: {len(overflow)}")
    print(f"  - 'Padrão-Ouro de Preparação Médica' poluído: {padrao_ouro_count}")
    print(f"  - 'questões estimadas' resíduos: {estimadas_count}")
    
    if empty:
        print(f"  [!] Exemplos de vazios: {[e[2] for e in empty[:3]]}")
        has_errors = True
    if overflow:
        print(f"  [!] Exemplos de overflow: {[(o[2], len(o[3])) for o in overflow[:3]]}")
        has_errors = True
    if padrao_ouro_count > 0 or estimadas_count > 0:
        has_errors = True
        
    overall_stats.append({
        'name': label,
        'temas': len(temas),
        'focos': total_focos,
        'subfocos': total_subfocos,
        'sub_subfocos': total_ss
    })

print("\n" + "="*50)
if has_errors:
    print("AUDIT STATUS: FAILED (Errors found)")
else:
    print("AUDIT STATUS: 100% PERFECT ACROSS ALL 6 SPECIALTIES!")
    total_all_temas = sum(s['temas'] for s in overall_stats)
    total_all_focos = sum(s['focos'] for s in overall_stats)
    total_all_subfocos = sum(s['subfocos'] for s in overall_stats)
    total_all_ss = sum(s['sub_subfocos'] for s in overall_stats)
    print(f"TOTAL PLATAFORMA: {len(files)} Especialidades | {total_all_temas} Temas | {total_all_focos} Focos | {total_all_subfocos} Subfocos | {total_all_ss} Sub-subfocos")
