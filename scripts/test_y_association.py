import sys
import pypdf

sys.stdout.reconfigure(encoding='utf-8')

reader = pypdf.PdfReader('C:/Users/cnath/Downloads/Catalogo_Canonico_Completo_Banco_Residencia_132k.pdf')
page = reader.pages[1] # Page 2

elements = []
def visitor(text, cm, tm, font_dict, font_size):
    t = text.strip()
    if t:
        elements.append({
            'text': t,
            'x': round(tm[4], 1),
            'y': round(tm[5], 1),
            'size': round(font_size, 1)
        })

page.extract_text(visitor_text=visitor)

# Separar subfocos e sub-subfocos
subfocos = []
subsubs = []

for i, el in enumerate(elements):
    # Subfoco: size ~ 12.0, x ~ 41.0
    if 11.8 <= el['size'] <= 12.5 and 38.0 <= el['x'] <= 45.0 and not el['text'].endswith('q') and not el['text'].endswith('questões') and not 'Temas' in el['text']:
        subfocos.append(el)
    elif el['text'] == '↳' and i + 1 < len(elements):
        next_el = elements[i+1]
        if not next_el['text'].startswith('Banco Residência'):
            subsubs.append({
                'text': next_el['text'],
                'y': el['y'],
                'x': el['x']
            })

print(f"Subfocos na página 2: {len(subfocos)}")
for s in subfocos:
    print(f"  y={s['y']}: {s['text']}")

print(f"\nSub-subfocos na página 2: {len(subsubs)}")
for ss in subsubs:
    print(f"  y={ss['y']}: {ss['text']}")

# Associar sub-subfoco ao subfoco cujo Y seja o maior y_sub <= y_ss
print("\n--- ASSOCIAÇÃO POR Y ---")
for s in subfocos:
    print(f"\n[SUBFOCO] {s['text']}:")
    # subsubs pertencentes a este subfoco: y_sub <= y_ss < proximo_y_sub
    # encontrar proximo subfoco com Y maior
    proximos = [s2['y'] for s2 in subfocos if s2['y'] > s['y']]
    max_y = min(proximos) if proximos else 9999.0
    
    associados = [ss for ss in subsubs if s['y'] <= ss['y'] < max_y]
    for ss in associados:
        print(f"   ↳ {ss['text']}")

