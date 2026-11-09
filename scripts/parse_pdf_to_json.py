import sys
import json
import re
import pypdf

sys.stdout.reconfigure(encoding='utf-8')

PDF_PATH = 'C:/Users/cnath/Downloads/Catalogo_Canonico_Completo_Banco_Residencia_132k.pdf'
reader = pypdf.PdfReader(PDF_PATH)

KNOWN_SPECIALTIES = [
    'Pediatria',
    'Ginecologia',
    'Obstetrícia',
    'Medicina Preventiva e Social',
    'Cirurgia Geral',
    'Clínica Médica'
]

tree = []
current_esp = None
current_tema = None
current_foco = None
current_subfoco = None

for page_num in range(1, len(reader.pages)):
    page = reader.pages[page_num]
    elements = []
    
    def visitor(text, cm, tm, font_dict, font_size):
        t = text.strip()
        if t:
            elements.append({
                'text': t,
                'x': round(tm[4], 1),
                'y': round(tm[5], 1),
                'size': round(font_size, 1)
            })
            
    page.extract_text(visitor_text=visitor)
    elements = [e for e in elements if e['y'] > 40]
    
    i = 0
    while i < len(elements):
        el = elements[i]
        txt = el['text']
        size = el['size']
        x = el['x']
        y = el['y']
        
        # 1. Especialidade
        if txt in KNOWN_SPECIALTIES and (size >= 20.0 or (i + 1 < len(elements) and 'Temas' in elements[i+1]['text'])):
            if not current_esp or current_esp['especialidade'] != txt:
                current_esp = {
                    'especialidade': txt,
                    'temas': []
                }
                tree.append(current_esp)
                current_tema = None
                current_foco = None
                current_subfoco = None
            i += 1
            continue
            
        if 'Temas •' in txt or 'questões' in txt.lower():
            i += 1
            continue
            
        # 2. Tema
        is_tema = False
        tema_text = ""
        
        if size >= 14.0 and size <= 16.0:
            if re.match(r'^\d+$', txt) and i + 1 < len(elements) and elements[i+1]['size'] >= 14.0:
                tema_num = txt
                tema_name = elements[i+1]['text']
                tema_text = f"{tema_num} {tema_name}"
                i += 1
                is_tema = True
            elif re.match(r'^\d+\s+[A-ZÁÉÍÓÚÂÊÔÃÕ]', txt):
                tema_text = txt
                is_tema = True
            elif not re.match(r'^\d', txt) and current_esp and len(current_esp['temas']) > 0 and current_tema and not current_foco:
                tema_text = f"{current_tema['tema']} {txt}"
                current_tema['tema'] = tema_text
                i += 1
                continue
            else:
                tema_text = txt
                is_tema = True
                
        if is_tema and current_esp:
            clean_tema = re.sub(r'^\d+\s+', '', tema_text).strip()
            if not current_tema or current_tema['tema'] != clean_tema:
                current_tema = {
                    'tema': clean_tema,
                    'focos': []
                }
                current_esp['temas'].append(current_tema)
                current_foco = None
                current_subfoco = None
            i += 1
            continue
            
        # 3. Foco
        if (size >= 13.0 and size <= 13.8) and x <= 35.0:
            foco_text = txt
            while i + 1 < len(elements) and (elements[i+1]['size'] >= 13.0 and elements[i+1]['size'] <= 13.8) and elements[i+1]['x'] <= 35.0:
                foco_text += " " + elements[i+1]['text']
                i += 1
                
            if current_tema:
                existing_foco = next((f for f in current_tema['focos'] if f['foco'] == foco_text), None)
                if existing_foco:
                    current_foco = existing_foco
                else:
                    current_foco = {
                        'foco': foco_text,
                        'subfocos': []
                    }
                    current_tema['focos'].append(current_foco)
                current_subfoco = None
            i += 1
            continue
            
        # 4. Subfoco
        if (size >= 11.8 and size <= 12.5) and (x >= 38.0 and x <= 45.0):
            subfoco_text = txt
            while i + 1 < len(elements) and (elements[i+1]['size'] >= 11.8 and elements[i+1]['size'] <= 12.5) and elements[i+1]['x'] <= 45.0 and not elements[i+1]['text'].endswith('q'):
                subfoco_text += " " + elements[i+1]['text']
                i += 1
                
            questoes_est = None
            if i + 1 < len(elements) and re.match(r'^\d+q$', elements[i+1]['text']):
                questoes_est = int(elements[i+1]['text'][:-1])
                i += 1
                
            if current_foco:
                existing_sub = next((s for s in current_foco['subfocos'] if s['subfoco'] == subfoco_text), None)
                if existing_sub:
                    current_subfoco = existing_sub
                else:
                    current_subfoco = {
                        'subfoco': subfoco_text,
                        'sub_subfocos': []
                    }
                    if questoes_est is not None:
                        current_subfoco['questoes_est'] = questoes_est
                    current_foco['subfocos'].append(current_subfoco)
            i += 1
            continue
            
        # 5. Sub-subfoco
        if txt == '↳':
            if i + 1 < len(elements):
                ss_text = elements[i+1]['text']
                i += 1
                while i + 1 < len(elements) and elements[i+1]['x'] >= 60.0 and elements[i+1]['size'] >= 11.0 and elements[i+1]['size'] <= 11.5 and elements[i+1]['text'] != '↳':
                    ss_text += " " + elements[i+1]['text']
                    i += 1
                
                ss_text = ss_text.strip()
                if ss_text and current_subfoco:
                    if ss_text not in current_subfoco['sub_subfocos']:
                        current_subfoco['sub_subfocos'].append(ss_text)
            i += 1
            continue
            
        elif x >= 60.0 and size >= 11.0 and size <= 11.5 and current_subfoco:
            ss_text = txt
            while i + 1 < len(elements) and elements[i+1]['x'] >= 60.0 and elements[i+1]['size'] >= 11.0 and elements[i+1]['size'] <= 11.5 and elements[i+1]['text'] != '↳':
                ss_text += " " + elements[i+1]['text']
                i += 1
            ss_text = ss_text.strip()
            if ss_text and current_subfoco:
                if ss_text not in current_subfoco['sub_subfocos']:
                    current_subfoco['sub_subfocos'].append(ss_text)
            i += 1
            continue
            
        i += 1

# Validação e Limpeza
total_sub_sub = 0
for esp in tree:
    for t in esp['temas']:
        for f in t['focos']:
            for s in f['subfocos']:
                # Limpar strings vazias ou espaços
                s['sub_subfocos'] = [ss.strip() for ss in s['sub_subfocos'] if ss.strip()]
                total_sub_sub += len(s['sub_subfocos'])

output_json_path = 'data/catalogo_arvore_canonica_completa.json'
with open(output_json_path, 'w', encoding='utf-8') as f:
    json.dump({
        'metadata': {
            'versao': '2.1.0-definitiva-canonica',
            'descricao': 'Catálogo Canônico Oficial de Especialidades Médicas do Banco Residência 132k',
            'fonte': 'Catalogo_Canonico_Completo_Banco_Residencia_132k.pdf',
            'data_extracao': '2026-11-07',
            'total_questoes': 132947,
            'total_especialidades': len(tree),
            'total_temas': sum(len(e['temas']) for e in tree),
            'total_focos': sum(sum(len(t['focos']) for t in e['temas']) for e in tree),
            'total_subfocos': sum(sum(sum(len(f['subfocos']) for f in t['focos']) for t in e['temas']) for e in tree),
            'total_sub_subfocos': total_sub_sub
        },
        'hierarquia_padrao': tree
    }, f, ensure_ascii=False, indent=2)

print(f"Salvo com sucesso em: {output_json_path}")
print(f"Total temas: {sum(len(e['temas']) for e in tree)}")
print(f"Total focos: {sum(sum(len(t['focos']) for t in e['temas']) for e in tree)}")
print(f"Total subfocos: {sum(sum(sum(len(f['subfocos']) for f in t['focos']) for t in e['temas']) for e in tree)}")
print(f"Total sub-subfocos: {total_sub_sub}")
