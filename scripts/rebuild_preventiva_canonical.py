import re
import json

PARTITION_CONFIG_PREV = {
    "Sistema Único de Saúde (SUS): Princípios e Legislação": [3, 3, 2, 3, 3, 2, 2, 2, 2, 2],
    "História das Políticas de Saúde e Gestão do SUS": [3, 2, 2, 2, 3, 2, 2, 2],
    "Atenção Primária à Saúde e Medicina de Família": [4, 3, 3, 2, 2, 3, 4, 4, 3, 2],
    "Medidas de Frequência e Associação Epidemiológica": [4, 2, 3, 2, 3, 2, 3, 3, 4, 2],
    "Desenhos de Estudos Epidemiológicos": [4, 2, 3, 2, 3, 2, 2, 2, 3, 2, 2, 3, 2, 2],
    "Acurácia de Testes Diagnósticos e Rastreamento": [3, 2, 3, 2, 3, 2, 2, 2, 2, 2],
    "Vigilância em Saúde e Notificação Compulsória": [2, 3, 3, 2, 2, 2, 2, 2, 2, 2],
    "Saúde do Trabalhador e Riscos Ocupacionais": [3, 3, 2, 2, 2, 2, 2, 2, 2, 2],
    "Bioética e Código de Ética Médica": [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    "Declaração de Óbito e Atestados Médicos": [4, 4, 2, 2, 2, 2],
    "Demografia Médica e Indicadores de Saúde": [4, 3, 2, 2, 2, 2, 2, 2]
}

def clean_tema_name(t):
    t = re.sub(r'^\d+\.\s*', '', t).strip()
    t = re.sub(r'^Tema:\s*', '', t).strip()
    return t

def clean_foco_name(f):
    f = re.sub(r'^\d+\.\d+\s*', '', f).strip()
    f = re.sub(r'^Foco:\s*', '', f).strip()
    return f

def clean_subfoco_name(s):
    s = re.sub(r'\s*\*\(.*?\)\*', '', s).strip()
    return s

def rebuild_preventiva():
    with open('docs/catalogo_medicina_preventiva.md', 'r', encoding='utf-8') as f:
        text = f.read()

    tema_splits = re.split(r'\n(?=### \d+\. Tema:)', text)
    
    temas_list = []
    
    for idx, sec in enumerate(tema_splits[1:], 1):
        tema_m = re.search(r'### \d+\. Tema:\s*(.*?)\n', sec)
        raw_tema = tema_m.group(1).strip()
        tema_name = clean_tema_name(raw_tema)
        
        # Extract all bullets in section (without slogan)
        raw_bullets = re.findall(r'^\s*\*\s*↳\s*`?(.*?)`?\s*$', sec, re.M)
        bullets = [b.strip('`').strip() for b in raw_bullets if 'Padrão-Ouro' not in b and 'Padrao-Ouro' not in b]
        
        # Split section into focos
        foco_splits = re.split(r'\n(?=#### \d+\.\d+ Foco:)', sec)
        
        focos_list = []
        tema_subfocos = []
        
        for f_sec in foco_splits[1:]:
            foco_m = re.search(r'#### \d+\.\d+ Foco:\s*(.*?)\n', f_sec)
            raw_foco = foco_m.group(1).strip()
            foco_name = clean_foco_name(raw_foco)
            
            subfocos_raw = re.findall(r'^\* \*\*Subfoco:\*\* (.*?)(?: *\*\(|\n|$)', f_sec, re.M)
            subfocos_clean = [clean_subfoco_name(s) for s in subfocos_raw]
            
            focos_list.append({
                "foco": foco_name,
                "subfocos_names": subfocos_clean
            })
            tema_subfocos.extend(subfocos_clean)
        
        # Partition bullets
        if tema_name not in PARTITION_CONFIG_PREV:
            raise KeyError(f"Tema '{tema_name}' not found in PARTITION_CONFIG_PREV")
        
        partitions = PARTITION_CONFIG_PREV[tema_name]
        if len(partitions) != len(tema_subfocos):
            raise ValueError(f"Partition len {len(partitions)} != subfocos len {len(tema_subfocos)} for {tema_name}")
        if sum(partitions) != len(bullets):
            raise ValueError(f"Sum of partitions {sum(partitions)} != bullets len {len(bullets)} for {tema_name}")
        
        # Assign bullets
        bullet_idx = 0
        assigned_map = {}
        for s_idx, sf_name in enumerate(tema_subfocos):
            cnt = partitions[s_idx]
            assigned_map[sf_name] = bullets[bullet_idx : bullet_idx + cnt]
            bullet_idx += cnt
            
        final_focos = []
        for f_item in focos_list:
            sf_objs = []
            for sf_name in f_item["subfocos_names"]:
                sf_objs.append({
                    "subfoco": sf_name,
                    "sub_subfocos": assigned_map[sf_name]
                })
            final_focos.append({
                "foco": f_item["foco"],
                "subfocos": sf_objs
            })
            
        temas_list.append({
            "tema": tema_name,
            "focos": final_focos
        })
        
    hierarchy = {
        "especialidade": "Medicina Preventiva e Social",
        "temas": temas_list
    }
    
    # Audit assertions
    total_focos = sum(len(t["focos"]) for t in temas_list)
    total_subfocos = sum(len(f["subfocos"]) for t in temas_list for f in t["focos"])
    total_ss = sum(len(s["sub_subfocos"]) for t in temas_list for f in t["focos"] for s in f["subfocos"])
    empty_subfocos = [s["subfoco"] for t in temas_list for f in t["focos"] for s in f["subfocos"] if len(s["sub_subfocos"]) == 0]
    overflow_subfocos = [(s["subfoco"], len(s["sub_subfocos"])) for t in temas_list for f in t["focos"] for s in f["subfocos"] if len(s["sub_subfocos"]) > 5]
    
    assert len(empty_subfocos) == 0, f"Found empty subfocos: {empty_subfocos}"
    assert len(overflow_subfocos) == 0, f"Found overflow subfocos: {overflow_subfocos}"
    
    # Audit slogan pollution
    json_str = json.dumps(hierarchy, ensure_ascii=False)
    assert 'Padrão-Ouro de Preparação Médica' not in json_str
    
    print(f"Medicina Preventiva Verificada: {len(temas_list)} Temas, {total_focos} Focos, {total_subfocos} Subfocos, {total_ss} Sub-subfocos.")
    
    # Generate TypeScript file
    ts_content = f'''import {{ SpecialtyHierarchy }} from "@/types";

export const preventivaHierarchy: SpecialtyHierarchy = {json.dumps(hierarchy, ensure_ascii=False, indent=2)};
'''
    with open('src/data/preventivaData.ts', 'w', encoding='utf-8') as f:
        f.write(ts_content)
        
    print("src/data/preventivaData.ts written successfully!")

if __name__ == '__main__':
    rebuild_preventiva()

