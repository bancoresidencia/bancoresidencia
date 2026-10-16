import json, sys

with open('data/mapeamento_instituicoes_gabaritos.json', 'r', encoding='utf-8') as f:
    mapping = json.load(f)

lote0 = [m for m in mapping if 'revalida' in m['instituicao'].lower() or 'enare' in m['instituicao'].lower() or 'enamed' in m['instituicao'].lower()]
others = [m for m in mapping if m not in lote0]

print('=== LOTE 1 (0..9) ===')
for i, m in enumerate(others[0:10]):
    print(f"{i+1}. {m['instituicao']}: total={m['total_questoes']}")

print('\n=== LOTE 2 (10..19) ===')
for i, m in enumerate(others[10:20]):
    print(f"{i+11}. {m['instituicao']}: total={m['total_questoes']}")

print('\n=== LOTE 3 (20..29) ===')
for i, m in enumerate(others[20:30]):
    print(f"{i+21}. {m['instituicao']}: total={m['total_questoes']}")

print('\n=== LOTE 4 (30..39) ===')
for i, m in enumerate(others[30:40]):
    print(f"{i+31}. {m['instituicao']}: total={m['total_questoes']}")
