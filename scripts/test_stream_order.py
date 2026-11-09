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

# Vamos imprimir em ordem natural (como foi desenhado no PDF stream)
print(f"Total elements on page 2: {len(elements)}")
for i, el in enumerate(elements):
    if el['size'] > 11.5 or el['text'] == '↳':
        # Se for ↳, pega o próximo também
        next_txt = elements[i+1]['text'] if i + 1 < len(elements) else ''
        print(f"[{i:02d}] y={el['y']}, x={el['x']}, size={el['size']}: {el['text']} {' -> ' + next_txt if el['text'] == '↳' else ''}")

