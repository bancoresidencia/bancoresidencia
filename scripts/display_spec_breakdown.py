import json

with open('scripts/deep_audit_results.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"{'Especialidade':<32} | {'Total':<8} | {'Homologadas':<11} | {'Com Comentário':<14} | {'Padrão Ouro':<11} | {'% Ouro/Total'}")
print("-" * 95)

specs = sorted(data['commentary_by_spec'].items(), key=lambda x: x[1]['total'], reverse=True)
for s, stats in specs:
    tot = stats['total']
    hom = stats['homologated']
    comm = stats['with_comm']
    gold = stats['gold']
    pct = (gold / tot * 100) if tot > 0 else 0
    print(f"{s:<32} | {tot:<8} | {hom:<11} | {comm:<14} | {gold:<11} | {pct:.2f}%")
