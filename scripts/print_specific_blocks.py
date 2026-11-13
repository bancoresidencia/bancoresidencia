import json

with open('data/amp_2024_pages/ocr_all_pages.json', 'r', encoding='utf-8-sig') as f:
    ocr_pages = json.load(f)

for p in ocr_pages:
    if 'SIATE' in p['text']:
        print(f"--- SIATE encontrado em {p['page']} ---")
        idx = p['text'].find('SIATE')
        print(p['text'][max(0, idx - 150): min(len(p['text']), idx + 400)])
    if 'mialg' in p['text'].lower():
        print(f"--- Mialgia encontrada em {p['page']} ---")
        idx = p['text'].lower().find('mialg')
        print(p['text'][max(0, idx - 150): min(len(p['text']), idx + 400)])

