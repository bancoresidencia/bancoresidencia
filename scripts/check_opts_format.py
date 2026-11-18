import json

with open('data/pending_10k_live.json', 'r', encoding='utf-8') as f:
    pending = json.load(f)

with open('data/knowledge/ajudamedico_consolidado_9223.json', 'r', encoding='utf-8') as f:
    ajuda_raw = json.load(f)
    ajuda = ajuda_raw['questoes']

print("Pending sample 0 options format:")
print(type(pending[0].get('options')), pending[0].get('options'))

print("\nAjuda sample 0 options format:")
print(type(ajuda[0].get('options')), ajuda[0].get('options'))
print("Ajuda officialAnswer:", ajuda[0].get('officialAnswer'))
