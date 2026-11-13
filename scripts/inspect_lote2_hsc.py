import json

with open('data/lote2_pending_index.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total entries in lote2_pending_index: {len(data)}")
hsc_entries = [d for d in data if 'HSC' in str(d.get('code', '')) or 'HSC' in str(d.get('institution', ''))]
print(f"HSC entries in lote2_pending_index: {len(hsc_entries)}")

if hsc_entries:
    print("Sample entry:", hsc_entries[0])
