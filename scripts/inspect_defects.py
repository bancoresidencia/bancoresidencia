import json

with open('data/relatorio_mega_bateria_testes.json', 'r', encoding='utf-8') as f:
    rep = json.load(f)

defects = rep.get('option_formatting_defects', [])
print(f"Total defeitos de formatação: {len(defects)}")
from collections import Counter
c = Counter(d.get('issue') for d in defects)
for k, v in c.items():
    print(f"  {k}: {v}")

print("\nAmostras:")
for d in defects[:5]:
    print(f"  [{d.get('spec')}] {d.get('code')} -> {d.get('issue')} | snippet: {d.get('snippet', '')}")
