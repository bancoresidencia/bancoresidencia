"""
Script para calibrar as ancoras canonicas por Tema e Especialidade.
Garante que cada tema tenha entre 6 e 15 focos canonicos ouro,
totalizando entre 780 e 820 focos para toda a base.
"""

import json, os, sys, re, unicodedata
from collections import Counter, defaultdict

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = r'd:\bancoresidencia\data'
STAGING_DIR = os.path.join(DATA_DIR, 'staging')

def norm(text):
    if not text:
        return ''
    t = unicodedata.normalize('NFD', str(text))
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn').lower()
    t = re.sub(r'[^a-z0-9]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()

def split_camel_case(s):
    s1 = re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', s)
    s2 = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1 \2', s1)
    return s2.strip()

with open(os.path.join(STAGING_DIR, 'analise_pre_fase1_focos.json'), 'r', encoding='utf-8') as f:
    analysis = json.load(f)

# Vamos inspecionar os temas com mais de 30 focos para entender as redundancias
high_foco_temas = []
for esp, temas in analysis.items():
    for tema, data in temas.items():
        if data['total_focos'] >= 25:
            high_foco_temas.append((esp, tema, data['total_focos'], data['total_questoes']))

high_foco_temas.sort(key=lambda x: x[2], reverse=True)
print(f"Total de temas com >= 25 focos: {len(high_foco_temas)}")
for esp, tema, n_focos, n_q in high_foco_temas:
    print(f"  {esp} | {tema}: {n_focos} focos ({n_q:,} questoes)")

