import re
import json

def clean_str(s):
    if '*(' in s:
        s = s[:s.rfind('*(')].strip()
    return s.strip().strip('"').strip('`')

# Exact partition counts per tema in Ginecologia
PARTITION_CONFIG_GIN = {
    'Fisiologia Menstrual e Sangramento Uterino Anormal': [3, 2, 3, 3, 2, 2], # 6 subs, 15 buls
    'Amenorreias e Distúrbios Neuroendócrinos': [3, 2, 5, 2, 2, 1, 2, 2], # 8 subs, 19 buls
    'Síndrome dos Ovários Policísticos e Hiperandrogenismo': [3, 3, 2, 2, 2, 2], # 6 subs, 14 buls
    'Climatério, Menopausa e Terapia Hormonal': [2, 2, 2, 3, 2, 2, 2, 2], # 8 subs, 17 buls
    'Planejamento Familiar e Métodos Contraceptivos': [3, 2, 2, 2, 2, 2, 2, 2, 4, 4, 2, 2, 2, 2], # 14 subs, 33 buls
    'Infecções Ginecológicas e Doença Inflamatória Pélvica': [2, 3, 3, 3, 4, 2, 2, 2, 2, 2, 2, 2], # 12 subs, 29 buls
    'Endometriose e Dor Pélvica Crônica': [3, 3, 2, 2, 2, 2], # 6 subs, 14 buls
    'Afecções Benignas do Trato Genital Feminino': [2] * 8, # 8 subs, 16 buls
    'Cânceres Ginecológicos e Lesões Precursoras': [2] * 12, # 12 subs, 24 buls
    'Doenças da Mama e Rastreamento': [3, 5, 2, 2, 2, 2, 2, 2, 2, 2], # 10 subs, 24 buls
    'Uroginecologia e Prolapsos Genitais': [2, 3, 2, 3, 2, 2, 2, 2], # 8 subs, 18 buls
    'Infertilidade Conjugal e Reprodução Assistida': [2] * 6, # 6 subs, 12 buls
    'Violência Sexual e Aspectos Médico-Legais': [2, 4, 2, 2, 2, 2] # 6 subs, 14 buls
}

with open('docs/catalogo_ginecologia.md', 'r', encoding='utf-8') as f:
    text = f.read()

tema_sections = re.split(r'\n### \d+\. Tema: ', text)[1:]

temas_data = []

for t_idx, sec in enumerate(tema_sections):
    lines = sec.strip().split('\n')
    raw_tema_name = lines[0].strip()
    clean_tema_name = re.sub(r'\s*\([^)]*\)', '', raw_tema_name).strip()
    
    foco_sections = re.split(r'\n#### \d+\.\d+ Foco: ', '\n'.join(lines[1:]))
    
    focos_list = []
    
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
        'bullets': bullets
    })

# Move the 7 spilled bullets from Tema 7 (Endometriose) to Tema 6 (Infecções / DIP)
# Monif, Ceftriaxona+Doxi, Complicações, Sífilis, Herpes, Diagnóstico lab, Conduta penicilina
t6 = next(t for t in temas_data if 'Infecções' in t['tema'])
t7 = next(t for t in temas_data if 'Endometriose' in t['tema'])
dip_syphilis_bullets = [b for b in t7['bullets'] if any(k in b for k in ['Monif', 'Antimicrobianos', 'Abscesso Tubo-Ovariano', 'Sífilis', 'Herpes', 'Campo Escuro', 'Penicilina'])]
t7['bullets'] = [b for b in t7['bullets'] if b not in dip_syphilis_bullets]
t6['bullets'].extend(dip_syphilis_bullets)

# Provide golden bullets for Tema 9 (Cânceres Ginecológicos) Focos 9.1 to 9.5
t9 = next(t for t in temas_data if 'Cânceres' in t['tema'])
t9_existing_bullets = t9['bullets'] # has 4 bullets for Vulva
t9_full_bullets = [
    # 9.1 Rastreamento e Prevenção do Câncer de Colo Uterino
    "Faixa Etária Prioritária (25 a 64 Anos) e Periodicidade Trienal após Dois Exames Anuais Consecutivos Negativos",
    "Rastreamento em Populações Especiais (Gestantes, Imunossuprimidas com HIV e Pós-Menopausa)",
    "Coleta Ectocervical com Espátula de Ayre e Endocervical com Escova de Zona de Transformação",
    "Critérios de Adequabilidade da Amostra Citológica e Representatividade da Junção Escamocolunar (JEC)",
    # 9.2 NIC e Lesões Precursoras
    "Conduta no ASC-US e LIEBG (Repetição Citológica em 6 Meses se >= 30 Anos ou 12 Meses se < 30 Anos)",
    "Conduta no ASC-H, LIEAG e AGC (Encaminhamento Direto e Obrigatório para Colposcopia)",
    "Achados Colposcópicos Maiores (Epitélio Acetobranco Denso, Mosaico e Pontilhado Grosseiros)",
    "Excisão da Zona de Transformação (EZT / CAF Tipos 1 e 2) vs Conização a Frio / Cirúrgica (Tipo 3)",
    # 9.3 Câncer de Colo Invasor
    "Estadiamento Clínico FIGO 2018 (Estádios Iniciais Restritos ao Colo vs Invasão Parametrial e Vagina)",
    "Critérios de Inoperabilidade e Tratamento Sistêmico (Acometimento Parametrial Estádio IIB em Diante com Quimiorradioterapia Definitiva)",
    "Traquelectomia Radical com Linfadenectomia Pélvica para Preservação de Fertilidade em Mulheres Jovens (IA2 e IB1)",
    "Cirurgia de Wertheim-Meigs (Histerectomia Radical com Linfadenectomia Pélvica Bilateral) nos Estádios Operáveis",
    # 9.4 Câncer de Endométrio e Hiperplasia
    "Hiperplasia sem Atipia (Manejo com Progestagênios Orais ou SIU-LNG) vs Atípica / EIN (Histerectomia Total)",
    "Quadro Clínico Típico: Sangramento Uterino Pós-Menopausa e Avaliação da Espessura Endometrial à USG (> 4-5 mm)",
    "Tipo I (Endometrioide, Dependente de Estrogênio, Bom Prognóstico) vs Tipo II (Seroso e Células Claras, Agressivo)",
    "Estadiamento Cirúrgico do Câncer de Endométrio (Laparotomia / Laparoscopia com Linfadenectomia e Omentectomia)",
    # 9.5 Câncer de Ovário
    "Regras Simples do IOTA para Diferenciação USG: Características B (Benignas) vs M (Malignas / Papilas, Ascite, Fluxo Doppler Alto)",
    "Marcadores Tumorais Séricos (CA-125 para Epitelial, HE4, Alfa-fetoproteína e hCG para Germinativos) e Escore ROMA",
    "Carcinoma Seroso de Alto Grau (Mais Comum, Origem na Fímbria Tubária e Forte Associação com Mutações BRCA1/2)",
    "Laparotomia Estadiadora Completa e Citorredução Cirúrgica Ótima com Resíduo Tumoral Zero (R0)"
] + t9_existing_bullets
t9['bullets'] = t9_full_bullets

# Assemble final hierarchy for Ginecologia
final_temas = []
total_subs_count = 0
total_sub_subs_count = 0

for t in temas_data:
    t_name = t['tema']
    counts = PARTITION_CONFIG_GIN[t_name]
    bullets = t['bullets']
    
    assert sum(counts) == len(bullets), f"Mismatch in {t_name}: counts sum {sum(counts)} != bullets {len(bullets)}"
    
    sub_pos = 0
    bullet_idx = 0
    t_focos_result = []
    
    for f in t['focos']:
        f_subfocos_result = []
        for s_name in f['subfocos']:
            n_b = counts[sub_pos]
            s_bullets = bullets[bullet_idx : bullet_idx + n_b]
            bullet_idx += n_b
            sub_pos += 1
            total_sub_subs_count += len(s_bullets)
            total_subs_count += 1
            f_subfocos_result.append({
                'subfoco': s_name,
                'sub_subfocos': s_bullets
            })
        t_focos_result.append({
            'foco': f['foco'],
            'subfocos': f_subfocos_result
        })
        
    final_temas.append({
        'tema': t_name,
        'focos': t_focos_result
    })

print(f"Ginecologia Verificada: {len(final_temas)} Temas, {total_subs_count} Subfocos, {total_sub_subs_count} Sub-subfocos.")

# Generate TypeScript file for Ginecologia
ts_output = 'import { SpecialtyHierarchy } from "@/types";\n\n'
ts_output += 'export const ginecologiaHierarchy: SpecialtyHierarchy = {\n'
ts_output += '  "especialidade": "Ginecologia",\n'
ts_output += '  "temas": ' + json.dumps(final_temas, ensure_ascii=False, indent=4) + '\n'
ts_output += '};\n'

with open('src/data/ginecologiaData.ts', 'w', encoding='utf-8') as f:
    f.write(ts_output)

print("src/data/ginecologiaData.ts written successfully!")
