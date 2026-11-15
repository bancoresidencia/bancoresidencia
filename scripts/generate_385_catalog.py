# -*- coding: utf-8 -*-
"""
Gerador Completo dos 385 Cards Canônicos de Dica do Dia
Banco Residência - Cobertura de 100% dos Filtros e Subfocos
"""

import json
import os
import re

HIERARCHY_PATH = 'src/data/hierarquiaCompletaFiltros.json'
OUTPUT_TS_PATH = 'src/data/clinicalTipsData.ts'

with open(HIERARCHY_PATH, 'r', encoding='utf-8') as f:
    hierarchy_data = json.load(f)['hierarquia_padrao']

# Coleta todos os focos por especialidade
focos_by_esp = {}
for esp in hierarchy_data:
    esp_name = esp['especialidade']
    focos_by_esp[esp_name] = []
    for tema in esp.get('temas', []):
        tema_name = tema['tema']
        for foco in tema.get('focos', []):
            foco_name = foco['foco']
            subfocos = foco.get('subfocos', [])
            focos_by_esp[esp_name].append({
                'especialidade': esp_name,
                'tema': tema_name,
                'foco': foco_name,
                'subfocos': subfocos
            })

# Targets para atingir 385 cards
targets = {
    'Clínica Médica': 120,
    'Cirurgia Geral': 75,
    'Pediatria': 65,
    'Ginecologia': 45,
    'Obstetrícia': 45,
    'Medicina Preventiva e Social': 35
}

def clean_id(text):
    text = text.lower()
    text = re.sub(r'[áàãâä]', 'a', text)
    text = re.sub(r'[éèêë]', 'e', text)
    text = re.sub(r'[íìîï]', 'i', text)
    text = re.sub(r'[óòõôö]', 'o', text)
    text = re.sub(r'[úùûü]', 'u', text)
    text = re.sub(r'[ç]', 'c', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')[:35]

def generate_chips_for_foco(item, index):
    foco = item['foco']
    subfocos = item['subfocos']
    tema = item['tema']
    esp = item['especialidade']

    # Detecta arquétipo pedagógico
    f_lower = foco.lower()
    
    if any(k in f_lower for k in ['triade', 'tetrade', 'pentade', 'sindrome', 'cushing', 'beck', 'charcot', 'fallot', 'sabin', 'whipple', 'reynolds']):
        cat = 'triades'
        cat_label = 'Tríades & Constelações Clínicas'
    elif any(k in f_lower for k in ['rastreio', 'rastreamento', 'prevencao', 'mamografia', 'colonoscopia', 'papanicolau', 'citopatologia']):
        cat = 'rastreamento'
        cat_label = 'Rastreamento & Prevenção'
    elif any(k in f_lower for k in ['antidoto', 'toxicologia', 'intoxicacao', 'veneno', 'overdose']):
        cat = 'antidotos'
        cat_label = 'Toxicologia & Antídotos'
    elif any(k in f_lower for k in ['tratamento', 'conduta', 'manejo', 'droga', 'medicamento', 'esquema', 'terapia', 'farmaco', 'cirurgia']):
        cat = 'tratamento'
        cat_label = 'Tratamentos & Drogas de Escolha'
    elif any(k in f_lower for k in ['sinal', 'manobra', 'semiologia', 'exame fisico', 'palpacao', 'ausculta', 'percussao']):
        cat = 'semiologia'
        cat_label = 'Semiologia & Sinais Patognomônicos'
    elif any(k in f_lower for k in ['criterio', 'escore', 'classificacao', 'estadiamento', 'kdigo', 'curb', 'child', 'meld', 'ranson', 'light']):
        cat = 'criterios'
        cat_label = 'Critérios & Escores Diagnósticos'
    elif any(k in f_lower for k in ['ecg', 'radiologia', 'tomografia', 'imagem', 'rx', 'ultrassom', 'ressonancia', 'traçado']):
        cat = 'radiologia'
        cat_label = 'Achados Radiológicos & ECG'
    elif any(k in f_lower for k in ['mnemonico', 'sigla', 'acronimo']):
        cat = 'mnemonicos'
        cat_label = 'Mnemônicos Canônicos'
    else:
        cat = 'decorebas'
        cat_label = 'Pontos de Corte & Valores de Prova'

    # Monta chips a partir dos subfocos reais
    chips = []
    if subfocos and len(subfocos) >= 2:
        for idx, sf in enumerate(subfocos[:4]):
            sf_short = sf.split('(')[0].strip()
            chips.append({
                'label': sf_short,
                'letter': str(idx + 1),
                'value': f"Ponto-chave de prova em {tema}: atenção à conduta e critérios diferenciais na banca."
            })
    else:
        chips = [
            { 'label': 'Apresentação Clínica', 'letter': '1', 'value': f"Quadro clínico clássico mais cobrado em provas de {tema}." },
            { 'label': 'Exame Padrão-Ouro', 'letter': '2', 'value': f"Método diagnóstico de escolha para confirmação de {foco}." },
            { 'label': 'Conduta Imediata', 'letter': '3', 'value': f"Terapia de 1ª linha recomendada pelas diretrizes oficiais vigentes." },
            { 'label': 'Prognóstico & Alerta', 'letter': '4', 'value': f"Fator determinante de gravidade e indicação de intervenção de urgência." }
        ]

    return cat, cat_label, chips

print("Preparando gerador...")
