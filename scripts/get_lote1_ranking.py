import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/mapeamento_instituicoes_gabaritos.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

filtered = []
for item in data:
    inst = item['instituicao']
    inst_lower = inst.lower()
    if 'revalida' in inst_lower or 'enare' in inst_lower or 'enamed' in inst_lower:
        continue
    filtered.append(item)

print(f"Total de instituicoes (sem Revalida/ENARE/ENAMED): {len(filtered)}")
print("\n=== TOP 10 INSTITUIÇÕES (LOTE 1) ===")
for i, item in enumerate(filtered[:10], 1):
    pct = item['percentual']
    print(f"{i}. {item['instituicao']} | Total: {item['total_questoes']} | Com Gabarito: {item['total_resolvidas']} ({pct}%) | Pendente: {item['sem_gabarito']}")
