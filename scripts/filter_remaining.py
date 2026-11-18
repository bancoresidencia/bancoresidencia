import json

with open('data/pending_10k_live.json', 'r', encoding='utf-8') as f:
    pending = json.load(f)

with open('data/manifesto_homologacao_ajuda_212.json', 'r', encoding='utf-8') as f:
    homologados = json.load(f)

homologated_ids = set(m['pending_id'] for m in homologados['matches'])
remaining_pending = [p for p in pending if p['id'] not in homologated_ids]

print(f"Antes: {len(pending)} | Homologadas: {len(homologated_ids)} | Restantes: {len(remaining_pending)}")
with open('data/pending_remaining_10005.json', 'w', encoding='utf-8') as f:
    json.dump(remaining_pending, f, ensure_ascii=False)
