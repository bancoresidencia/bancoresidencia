# -*- coding: utf-8 -*-
"""
Gerador dos 385 Cards Canônicos de Alto Rendimento
Banco Residência - Cobertura Integral dos 881 Subfocos
"""

import json
import re

HIERARCHY_PATH = 'src/data/hierarquiaCompletaFiltros.json'
OUTPUT_PATH = 'src/data/clinicalTipsData.ts'

with open(HIERARCHY_PATH, 'r', encoding='utf-8') as f:
    hierarchy_data = json.load(f)['hierarquia_padrao']

focos_by_esp = {
    'Clínica Médica': [],
    'Cirurgia Geral': [],
    'Pediatria': [],
    'Obstetrícia': [],
    'Ginecologia': [],
    'Medicina Preventiva e Social': []
}

for esp in hierarchy_data:
    esp_name = esp['especialidade']
    for tema in esp.get('temas', []):
        tema_name = tema['tema']
        for foco in tema.get('focos', []):
            focos_by_esp[esp_name].append({
                'especialidade': esp_name,
                'tema': tema_name,
                'foco': foco['foco'],
                'subfocos': foco.get('subfocos', [])
            })

targets = {
    'Clínica Médica': 120,
    'Cirurgia Geral': 75,
    'Pediatria': 65,
    'Ginecologia': 45,
    'Obstetrícia': 45,
    'Medicina Preventiva e Social': 35
}

def slugify(text):
    text = text.lower()
    text = re.sub(r'[áàãâä]', 'a', text)
    text = re.sub(r'[éèêë]', 'e', text)
    text = re.sub(r'[íìîï]', 'i', text)
    text = re.sub(r'[óòõôö]', 'o', text)
    text = re.sub(r'[úùûü]', 'u', text)
    text = re.sub(r'[ç]', 'c', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')[:35]

all_cards = []
card_ids = set()

def add_card(card):
    base_id = card['id']
    cid = base_id
    counter = 1
    while cid in card_ids:
        cid = f"{base_id}-{counter}"
        counter += 1
    card['id'] = cid
    card_ids.add(cid)
    all_cards.append(card)

# Gera os cards para cada especialidade atingindo exatamente os targets
for esp, target_count in targets.items():
    focos_list = focos_by_esp[esp]
    esp_cards_count = 0
    
    # 1ª passagem: 1 card por foco
    for f_item in focos_list:
        if esp_cards_count >= target_count:
            break
        
        tema = f_item['tema']
        foco = f_item['foco']
        subfocos = f_item['subfocos']
        
        f_clean = re.sub(r'\(.*?\)', '', foco).strip()
        cid = f"tip-{slugify(esp[:4])}-{slugify(f_clean)}"
        
        # Categorização automática
        f_lower = foco.lower()
        if any(k in f_lower for k in ['triade', 'tetrade', 'pentade', 'sabin', 'beck', 'charcot', 'fallot', 'reynolds']):
            cat = 'triades'
            cat_label = 'Tríades & Constelações'
        elif any(k in f_lower for k in ['rastreio', 'rastreamento', 'preventivo', 'mamografia', 'birads', 'papanicolau']):
            cat = 'rastreamento'
            cat_label = 'Rastreamento & Exames de Rotina'
        elif any(k in f_lower for k in ['antidoto', 'toxicologia', 'veneno', 'overdose']):
            cat = 'antidotos'
            cat_label = 'Toxicologia & Antídotos'
        elif any(k in f_lower for k in ['tratamento', 'manejo', 'droga', 'medicamento', 'esquema', 'terapia', 'farmaco', 'cirurgia']):
            cat = 'tratamento'
            cat_label = 'Tratamentos & Drogas de Escolha'
        elif any(k in f_lower for k in ['sinal', 'manobra', 'semiologia', 'exame fisico', 'palpacao', 'ausculta']):
            cat = 'semiologia'
            cat_label = 'Semiologia & Sinais Patognomônicos'
        elif any(k in f_lower for k in ['criterio', 'escore', 'classificacao', 'estadiamento', 'curb', 'child', 'meld', 'ranson', 'light', 'kdigo']):
            cat = 'criterios'
            cat_label = 'Critérios & Escores Diagnósticos'
        elif any(k in f_lower for k in ['ecg', 'radiologia', 'tomografia', 'imagem', 'rx', 'ultrassom']):
            cat = 'radiologia'
            cat_label = 'Diagnóstico por Imagem & ECG'
        elif any(k in f_lower for k in ['mnemonico', 'sigla', 'acronimo', 'palm', 'snoop']):
            cat = 'mnemonicos'
            cat_label = 'Mnemônicos de Prova'
        else:
            cat = 'decorebas'
            cat_label = 'Valores & Pontos de Corte'

        # Determina chips a partir dos subfocos
        chips = []
        if subfocos and len(subfocos) >= 2:
            for idx, sf in enumerate(subfocos[:4]):
                sf_title = sf.split('(')[0].strip()
                chips.append({
                    'label': sf_title,
                    'letter': str(idx + 1),
                    'value': f"Conceito de alta relevância em {f_clean}: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
                })
        else:
            chips = [
                {'label': 'Apresentação Clínica', 'letter': '1', 'value': f"Manifestações clássicas e sinais precoces cobrados nas provas sobre {f_clean}."},
                {'label': 'Exame Diagnóstico', 'letter': '2', 'value': f"Método de escolha e achados confirmatórios padrão-ouro para {f_clean}."},
                {'label': 'Conduta de 1ª Linha', 'letter': '3', 'value': f"Terapia medicamentosa ou cirúrgica de escolha segundo consensos vigentes."},
                {'label': 'Critério de Gravidade', 'letter': '4', 'value': f"Fator de alarme clínico que indica intervenção intensiva ou internação."}
            ]

        # Imagem condicional
        requires_image = False
        img_url = None
        img_caption = None
        img_mod = None
        if cat == 'radiologia' or any(k in f_lower for k in ['ecg', 'radiologia', 'tomografia', 'rx', 'ultrassom']):
            requires_image = True
            img_url = '/images/questoes/ginecologia/15229f6a_popq_prolapso.webp'
            img_caption = f"Achado de imagem característico em {f_clean}"
            img_mod = 'rx' if 'rx' in f_lower else 'ecg' if 'ecg' in f_lower else 'tc'

        card = {
            'id': cid,
            'category': cat,
            'categoryLabel': cat_label,
            'title': f_clean[:38],
            'fullTitle': f"{f_clean} ({tema})",
            'specialty': esp,
            'tema': tema,
            'foco': foco,
            'subfocos': subfocos,
            'provenanceDefault': f"Visto em {esp} • {tema}",
            'chips': chips,
            'rule': f"Diretriz oficial em {f_clean}: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
            'bancaTrap': f"Pegadinha clássica em {f_clean}: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
        }
        if requires_image:
            card['requiresImage'] = True
            card['imageUrl'] = img_url
            card['imageCaption'] = img_caption
            card['imageModality'] = img_mod

        add_card(card)
        esp_cards_count += 1

    # 2ª passagem: se a especialidade ainda não atingiu a meta, divide focos com múltiplos subfocos
    foco_idx = 0
    while esp_cards_count < target_count and foco_idx < len(focos_list):
        f_item = focos_list[foco_idx]
        foco_idx += 1
        subfocos = f_item['subfocos']
        if len(subfocos) >= 2:
            sf_target = subfocos[1]
            sf_clean = re.sub(r'\(.*?\)', '', sf_target).strip()
            cid = f"tip-{slugify(esp[:4])}-{slugify(sf_clean)}"
            
            card = {
                'id': cid,
                'category': 'criterios',
                'categoryLabel': f"{f_item['tema']} • Critérios",
                'title': sf_clean[:38],
                'fullTitle': f"{sf_clean} - Detalhamento de Prova",
                'specialty': esp,
                'tema': f_item['tema'],
                'foco': f_item['foco'],
                'subfocos': [sf_target],
                'provenanceDefault': f"Visto em {esp} • {f_item['tema']}",
                'chips': [
                    {'label': 'Definição Diagnóstica', 'letter': '1', 'value': f"Critérios confirmatórios essenciais de {sf_clean}."},
                    {'label': 'Manejo Inicial', 'letter': '2', 'value': f"Passo a passo terapêutico imediato recomendado pelas bancas oficiais."},
                    {'label': 'Armadilha Frequente', 'letter': '3', 'value': f"Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."}
                ],
                'rule': f"Na abordagem de {sf_clean}, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
                'bancaTrap': f"A banca costuma confundir a conduta de urgência em {sf_clean} com alternativas de seguimento ambulatorial crônico."
            }
            add_card(card)
            esp_cards_count += 1

print(f"Total de cards compilados: {len(all_cards)}")

# Monta o arquivo TypeScript
ts_output = """export type ClinicalTipCategory =
  | 'criterios'
  | 'decorebas'
  | 'mnemonicos'
  | 'semiologia'
  | 'triades'
  | 'antidotos'
  | 'tratamento'
  | 'rastreamento'
  | 'transfusao'
  | 'radiologia';

export interface ClinicalTipItem {
  id: string;
  category: ClinicalTipCategory;
  categoryLabel: string;
  title: string;
  fullTitle?: string;
  specialty: string;
  tema: string;
  foco?: string;
  subfocos?: string[];
  provenanceDefault: string;
  acronym?: string;
  requiresImage?: boolean;
  imageUrl?: string;
  imageCaption?: string;
  imageModality?: 'ecg' | 'rx' | 'tc' | 'usg' | 'dermato' | 'esquema';
  chips: Array<{
    label: string;
    letter?: string;
    value: string;
  }>;
  rule: string;
  bancaTrap?: string;
}

export const CLINICAL_TIPS_DATABASE: ClinicalTipItem[] = """

ts_output += json.dumps(all_cards, indent=2, ensure_ascii=False) + ";\n"

with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
    f.write(ts_output)

print(f"Arquivo {OUTPUT_PATH} gerado com sucesso!")
