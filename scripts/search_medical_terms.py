import json
import re

with open('data/amp_2024_pages/ocr_all_pages.json', 'r', encoding='utf-8-sig') as f:
    ocr_pages = json.load(f)

terms = [
    'arma branca', 'hemitórax', 'subescapular', 'intercostal',
    'enteral', 'parenteral', 'perioperatório',
    'broncoespasmo', 'alta médica', 'Conselho Tutelar',
    'apendicectomia', 'ferida operatória',
    'menstruou', 'relação sexual', 'hímen imperfurado', 'septovaginal',
    'febre, cefaleia, apatia', 'líquor', 'meningite'
]

for p in ocr_pages:
    txt = p['text'].lower()
    for t in terms:
        if t in txt:
            print(f"[TERMO ENCONTRADO] '{t}' em {p['page']}:")
            idx = txt.find(t)
            print(txt[max(0, idx - 100): min(len(txt), idx + 250)])
            print("-" * 50)

