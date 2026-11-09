import sys
import pypdf

sys.stdout.reconfigure(encoding='utf-8')

reader = pypdf.PdfReader('C:/Users/cnath/Downloads/Catalogo_Canonico_Completo_Banco_Residencia_132k.pdf')
page = reader.pages[1] # Page 2

elements = []
def visitor(text, cm, tm, font_dict, font_size):
    if text.strip():
        elements.append({
            'text': text.strip(),
            'x': round(tm[4], 1),
            'y': round(tm[5], 1),
            'size': round(font_size, 1),
        })

page.extract_text(visitor_text=visitor)

# Vamos agrupar por Y ou ver do maior Y para o menor
# No PDF do pypdf, y costuma crescer de baixo para cima, ou aqui de cima para baixo?
# Vamos ver min e max y
ys = [e['y'] for e in elements]
print(f"Min Y: {min(ys)}, Max Y: {max(ys)}")

# Elementos com size >= 13
for el in elements:
    if el['size'] >= 13.0 or el['y'] > 1650 or el['y'] < 200:
        print(f"y={el['y']}, x={el['x']}, size={el['size']}: {el['text']}")
