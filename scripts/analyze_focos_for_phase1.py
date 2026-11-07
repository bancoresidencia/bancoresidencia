"""
Analise detalhada de todos os 1.546 focos atuais:
- Focos CamelCase
- Focos por Tema
- Candidatos a ancoras canonicas
"""

import json, os, sys, re
from collections import Counter, defaultdict

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = r'd:\bancoresidencia\data'
FILES = [
    'medicina_preventiva_final_questions.json',
    'pediatria_final_questions.json',
    'cirurgia_final_questions.json',
    'ginecologia_final_questions.json',
    'obstetricia_final_questions.json',
    'clinica_medica_final_questions.json'
]

tree = defaultdict(lambda: defaultdict(Counter))

for filename in FILES:
    p = os.path.join(DATA_DIR, filename)
    with open(p, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    for q in questions:
        esp = q.get('especialidade') or 'Desconhecido'
        tema = q.get('tema') or 'Desconhecido'
        foco = q.get('foco') or 'Desconhecido'
        tree[esp][tema][foco] += 1

camel_pattern = re.compile(r'([a-z])([A-Z])')

print("=== DISTRIBUICAO POR ESPECIALIDADE E TEMA ===")
total_camel = 0
total_small = 0

analysis_data = {}

for esp, temas in sorted(tree.items()):
    analysis_data[esp] = {}
    print(f"\n--- {esp} ({len(temas)} temas) ---")
    for tema, focos in sorted(temas.items()):
        foco_list = []
        camel_in_tema = []
        small_in_tema = []
        anchors = []
        for f, cnt in focos.most_common():
            is_camel = bool(camel_pattern.search(f)) and not ('(' in f and ')' in f and len(f.split()) > 1 and not camel_pattern.search(f.split('(')[0]))
            if is_camel:
                camel_in_tema.append((f, cnt))
                total_camel += 1
            if cnt <= 10:
                small_in_tema.append((f, cnt))
                total_small += 1
            if cnt >= 100:
                anchors.append((f, cnt))
            foco_list.append({"foco": f, "count": cnt, "is_camel": is_camel})
            
        analysis_data[esp][tema] = {
            "total_focos": len(focos),
            "total_questoes": sum(focos.values()),
            "camels": camel_in_tema,
            "small": small_in_tema,
            "anchors": anchors
        }
        if camel_in_tema or len(focos) > 15:
            print(f"  [{tema}]: {len(focos)} focos ({sum(focos.values()):,} q) | {len(camel_in_tema)} Camels | {len(anchors)} ancoras (>=100 q)")
            if camel_in_tema:
                print(f"     Ex Camels: {[c[0] for c in camel_in_tema[:5]]}")

print(f"\nTOTAL GERAL DE CAMELCASES DETECTADOS: {total_camel}")
print(f"TOTAL GERAL DE FOCOS <= 10 QUESTOES: {total_small}")

with open(r'd:\bancoresidencia\data\staging\analise_pre_fase1_focos.json', 'w', encoding='utf-8') as f:
    json.dump(analysis_data, f, indent=2, ensure_ascii=False)
print("Analise salva em data/staging/analise_pre_fase1_focos.json")

