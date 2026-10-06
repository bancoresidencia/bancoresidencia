
import pypdf, re, json

reader = pypdf.PdfReader('data/enare_raw/enare_2021_prova.pdf')
print(f'Total pages: {len(reader.pages)}')

# Extrai todas as paginas
full_text = ''
for i, page in enumerate(reader.pages):
    try:
        text = page.extract_text()
        full_text += text + '\n'
    except:
        pass

lines = full_text.split('\n')
print(f'Total lines: {len(lines)}')

# Salva texto completo para inspecao
with open('data/enare_raw/enare_2021_full_text.txt', 'w', encoding='utf-8') as f:
    f.write(full_text)

print('Texto salvo. Primeiras 50 linhas da pagina 2:')
start = 0
for i, line in enumerate(lines):
    if 'Tipo  01' in line and 'DIRETO' in line:
        start = i
        break

for j in range(start, min(start + 60, len(lines))):
    print(f'{j}: {lines[j]}')
