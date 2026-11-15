# -*- coding: utf-8 -*-
"""
Script de Geração do Catálogo Canônico de 385 Cards Clínicos
Banco Residência - Cobertura de 100% dos Filtros e Subfocos
"""

import json
import os
import re

HIERARCHY_PATH = 'src/data/hierarquiaCompletaFiltros.json'
OUTPUT_PATH = 'src/data/clinicalTipsData.ts'

with open(HIERARCHY_PATH, 'r', encoding='utf-8') as f:
    hierarchy_data = json.load(f)['hierarquia_padrao']

# Lê os cards já existentes para preservá-los
with open(OUTPUT_PATH, 'r', encoding='utf-8') as f:
    existing_content = f.read()

# Extrai os cards já existentes na forma de texto entre [ e ];
cards_start = existing_content.find('export const CLINICAL_TIPS_DATABASE: ClinicalTipItem[] = [')
existing_header = existing_content[:cards_start]

print("Iniciando montagem do catálogo dos 385 cards...")
