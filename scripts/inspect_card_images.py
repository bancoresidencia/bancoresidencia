import json

with open('src/data/clinicalTipsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

prefix = 'export const CLINICAL_TIPS_DATABASE: ClinicalTipItem[] = '
start_idx = text.find(prefix) + len(prefix)
end_idx = text.rfind('];') + 1

json_str = text[start_idx:end_idx]

cards = json.loads(json_str)

print(f"Total cards: {len(cards)}")
cards_with_image = [c for c in cards if c.get('imageUrl')]
print(f"Cards com imagem: {len(cards_with_image)}\n")

for i, c in enumerate(cards_with_image):
    spec = c.get('specialty')
    title = c.get('title')
    foco = c.get('foco', '')
    img = c.get('imageUrl', '').split('/')[-1]
    mod = c.get('imageModality', '')
    print(f"#{i+1}: [{spec}] '{title}'\n   Foco: '{foco}'\n   Modality: {mod} | Img: {img}\n")
