import json
from collections import defaultdict

with open('data/supabase_v3_classifications.json', encoding='utf-8') as f:
    classifications = json.load(f)

print(f"Total classified items: {len(classifications):,}")

spec_stats = defaultdict(lambda: {
    "total": 0,
    "padrao_ouro": 0,
    "comentada": 0,
    "sem_comentario": 0,
    "has_images": 0,
    "no_images": 0
})

for qid, c in classifications.items():
    esp = c.get('e', 'NÃO DEFINIDA')
    ct = c.get('ct', 'sem_comentario')
    hi = c.get('hi', False)
    
    spec_stats[esp]["total"] += 1
    if ct == 'padrao_ouro':
        spec_stats[esp]["padrao_ouro"] += 1
    elif ct == 'comentada':
        spec_stats[esp]["comentada"] += 1
    else:
        spec_stats[esp]["sem_comentario"] += 1
        
    if hi:
        spec_stats[esp]["has_images"] += 1
    else:
        spec_stats[esp]["no_images"] += 1

# Sort by total
sorted_specs = sorted(spec_stats.items(), key=lambda x: x[1]["total"], reverse=True)

print("=" * 115)
print(f"{'Especialidade (V3 Live Supabase)':30} | {'Total':8} | {'Padrão Ouro':12} | {'% Ouro':7} | {'Legado':8} | {'Sem Coment.':12} | {'Com Imagem':11} | {'Texto Puro':11}")
print("=" * 115)

tot = defaultdict(int)
for esp, s in sorted_specs:
    pct_ouro = (s["padrao_ouro"] / s["total"] * 100) if s["total"] else 0
    print(f"{esp:30} | {s['total']:8d} | {s['padrao_ouro']:12d} | {pct_ouro:6.1f}% | {s['comentada']:8d} | {s['sem_comentario']:12d} | {s['has_images']:11d} | {s['no_images']:11d}")
    for k in s:
        tot[k] += s[k]

print("=" * 115)
pct_tot_ouro = (tot["padrao_ouro"] / tot["total"] * 100) if tot["total"] else 0
print(f"{'TOTAL GERAL SUPABASE V3':30} | {tot['total']:8d} | {tot['padrao_ouro']:12d} | {pct_tot_ouro:6.1f}% | {tot['comentada']:8d} | {tot['sem_comentario']:12d} | {tot['has_images']:11d} | {tot['no_images']:11d}")
print("=" * 115)
