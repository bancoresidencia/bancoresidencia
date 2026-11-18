import json

with open('data/ajudamedico_vs_platform_report.json', 'r', encoding='utf-8') as f:
    rep = json.load(f)

with open('data/pending_10k_live.json', 'r', encoding='utf-8') as f:
    pending = json.load(f)

pending_ids = set(p['id'] for p in pending)

sem_gabarito_ajuda = rep.get('jaNaPlataforma', {}).get('semGabarito', {})
print("semGabarito total in report:", sem_gabarito_ajuda.get('total'))

# In report, did it save the full list of supabaseId?
exemplos = sem_gabarito_ajuda.get('exemplos', [])
print(f"Exemplos listados: {len(exemplos)}")
in_pending_count = sum(1 for e in exemplos if e.get('supabaseId') in pending_ids)
print(f"Exemplos que ainda estão nas 10k pendências: {in_pending_count}")

# Check how many of the 3045 questions from report are currently in pending_ids
# Let's inspect analyze_ajudamedico_vs_platform.mjs
