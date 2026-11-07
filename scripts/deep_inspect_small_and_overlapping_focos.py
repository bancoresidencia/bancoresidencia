import json
import re
import unicodedata
from collections import defaultdict

with open('.reports/recategorizacao/censo_mestre_consolidado_259k.json', 'r', encoding='utf-8') as fp:
    censo = json.load(fp)

# Carregar também o censo original de 132k para comparar o que era canônico antes
with open('.reports/recategorizacao/harmonizada/censo_mestre_harmonizado_132k.json', 'r', encoding='utf-8') as fp:
    censo_132k = json.load(fp)

focos_132k_set = set()
for esp, temas in censo_132k.items():
    for tema, focos in temas.items():
        for foco in focos.keys():
            focos_132k_set.add(foco.strip().lower())

print(f"[INFO] Total de focos na base canônica prévia (132k): {len(focos_132k_set)}")

all_focos_259k = []
for esp, temas in censo.items():
    for tema, focos in temas.items():
        for foco, f_data in focos.items():
            all_focos_259k.append({
                'especialidade': esp,
                'tema': tema,
                'foco': foco,
                'total': f_data['total'],
                'subfocos': f_data['subfocos'],
                'in_132k': (foco.strip().lower() in focos_132k_set)
            })

print(f"[INFO] Total de focos na base atual (259k): {len(all_focos_259k)}")
focos_legados_132k = [f for f in all_focos_259k if f['in_132k']]
focos_novos_expansao = [f for f in all_focos_259k if not f['in_132k']]

print(f"  • Focos herdados da base canônica (132k): {len(focos_legados_132k):,} focos ({sum(f['total'] for f in focos_legados_132k):,} questões)")
print(f"  • Focos NOVOS introduzidos pela expansão: {len(focos_novos_expansao):,} focos ({sum(f['total'] for f in focos_novos_expansao):,} questões)")

# Análise dos focos novos da expansão por tamanho
tam_novos = {
    '1 questao': [f for f in focos_novos_expansao if f['total'] == 1],
    '2 a 5 questoes': [f for f in focos_novos_expansao if 2 <= f['total'] <= 5],
    '6 a 10 questoes': [f for f in focos_novos_expansao if 6 <= f['total'] <= 10],
    '11 a 50 questoes': [f for f in focos_novos_expansao if 11 <= f['total'] <= 50],
    'Mais de 50 questoes': [f for f in focos_novos_expansao if f['total'] > 50]
}

print("\n--- DISTRIBUIÇÃO DOS FOCOS NOVOS DA EXPANSÃO ---")
for k, v in tam_novos.items():
    total_q = sum(f['total'] for f in v)
    print(f"• {k:20s}: {len(v):4d} focos ({total_q:6,d} questões)")

# Amostras de focos novos com 1 a 5 questões
print("\n--- AMOSTRA DE FOCOS NOVOS COM 1 A 3 QUESTÕES (CANDIDATOS A MESCLAGEM) ---")
for f in tam_novos['1 questao'][:20]:
    print(f"[{f['especialidade']} | {f['tema']}] ({f['total']} q): \"{f['foco']}\"")

