import fitz, sys
sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open('data/official_exams/SUS_BA/SUS_BA_2023_GB_DEF_AD.pdf')
print(f'Total de páginas: {len(doc)}')
for i in range(len(doc)):
    txt = doc[i].get_text().replace('\n', ' ')
    print(f'Página {i}: {txt[:200]}')
