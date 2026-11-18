import json
from collections import Counter

with open('data/resultado_cruzamento_ajudamedico_10k.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

matches = data.get('matches', [])
print(f"Total Matches: {len(matches)}")

# Distribuição por ano
year_counts = Counter(m.get('year') for m in matches)
print("\nPor Ano:", sorted(year_counts.items()))

# Distribuição por instituição (Top 10)
inst_counts = Counter(m.get('institution') for m in matches)
print("\nTop 10 Instituições resolvidas:")
for inst, c in inst_counts.most_common(10):
    print(f"  - {inst}: {c} questões")

# Distribuição de Similaridade
sim_ranges = {
    '100% exata (1.0)': sum(1 for m in matches if m['combined_similarity'] == 1.0),
    '95% a 99.9%': sum(1 for m in matches if 0.95 <= m['combined_similarity'] < 1.0),
    '90% a 94.9%': sum(1 for m in matches if 0.90 <= m['combined_similarity'] < 0.95),
    '85% a 89.9%': sum(1 for m in matches if 0.85 <= m['combined_similarity'] < 0.90),
}
print("\nFaixas de Similaridade:", sim_ranges)

# Gabaritos resolvidos
ans_dist = Counter(m.get('resolved_letter') for m in matches)
print("\nDistribuição dos Gabaritos:", sorted(ans_dist.items()))
