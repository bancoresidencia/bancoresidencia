import pypdf

reader = pypdf.PdfReader('d:/bancoresidencia/data/enare_test/enare_2023_gabarito.pdf')
print(f'Total pages in gabarito: {len(reader.pages)}')

for idx, page in enumerate(reader.pages):
    txt = page.extract_text() or ""
    if "ACESSO DIRETO" in txt.upper() and ("TIPO 1" in txt.upper() or "T361" in txt.upper() or "PROVA 01" in txt.upper() or "TIPO 01" in txt.upper()):
        print(f"=== Found Acesso Direto Tipo 1 on page {idx+1} ===")
        print(txt[:1000])
        print("...")
        with open('d:/bancoresidencia/data/enare_test/gabarito_tipo1.txt', 'w', encoding='utf-8') as f:
            f.write(txt)
        break
