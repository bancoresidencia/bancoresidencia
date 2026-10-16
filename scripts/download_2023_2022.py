import urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

files = [
    ('PSU_MG_2023_GABARITO_PRELIMINAR_TIPO1.pdf', 'https://www.galaxcms.com.br/up_crud_comum/601/GABARITOPROVAGERALTIPO1-PSU2023-20221204141710.pdf'),
    ('PSU_MG_2022_GABARITO_PRELIMINAR_TIPO1.pdf', 'https://www.galaxcms.com.br/up_crud_comum/601/GabaritoprovisorioPSU2022-20211205151729.pdf')
]

for fname, url in files:
    fpath = f"data/official_exams/PSU_MG/{fname}"
    pdf_data = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=15).read()
    with open(fpath, 'wb') as f: f.write(pdf_data)
    print(f"Saved {fname} ({len(pdf_data)} bytes)")
