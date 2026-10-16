import urllib.request, ssl, re, os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

out_dir = 'data/official_exams/PSU_MG'
os.makedirs(out_dir, exist_ok=True)

announcements = [
    (2023, 'preliminar', 'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-gabarito-preliminar-de-prova--psu-2023/1281'),
    (2023, 'definitivo', 'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-gabaritos-definitivos-apos-analise-de-recursos--psu-2023/1285'),
    (2022, 'preliminar', 'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-gabarito-preliminar-de-prova--psu-2022/1128'),
    (2022, 'definitivo', 'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-gabaritos-definitivos-apos-analise-de-recursos--psu-2022/1132'),
    (2021, 'preliminar', 'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-gabarito-preliminar-de-prova--psu-2021/937'),
    (2021, 'definitivo', 'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-gabaritos-definitivos-apos-analise-de-recursos--psu-2021/940'),
    (2020, 'preliminar', 'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-gabarito-preliminar-de-prova--psu-2020/766'),
    (2020, 'definitivo', 'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-gabaritos-definitivos-apos-analise-de-recursos--psu-2020/769'),
]

for year, kind, url in announcements:
    try:
        html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
        links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
        for href, text in links:
            clean = re.sub(r'<[^>]+>', ' ', text).strip()
            # We want PROVA GERAL TIPO 1 or ALTERACAO DE GABARITO
            if kind == 'preliminar' and ('geral tipo 1' in clean.lower() or 'geral 1' in clean.lower() or 'geral' in clean.lower()):
                fname = f"PSU_MG_{year}_GABARITO_PRELIMINAR_TIPO1.pdf"
                fpath = os.path.join(out_dir, fname)
                if not os.path.exists(fpath):
                    print(f"Downloading {fname} from {href}...")
                    pdf_data = urllib.request.urlopen(urllib.request.Request(href, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=15).read()
                    with open(fpath, 'wb') as f: f.write(pdf_data)
                    print(f"Saved {fname} ({len(pdf_data)} bytes)")
                break
            elif kind == 'definitivo' and ('altera' in clean.lower() or 'gabarito' in clean.lower() or 'definitivo' in clean.lower()):
                fname = f"PSU_MG_{year}_ALTERACAO_GABARITO_DEFINITIVO.pdf"
                fpath = os.path.join(out_dir, fname)
                if not os.path.exists(fpath):
                    print(f"Downloading {fname} from {href}...")
                    pdf_data = urllib.request.urlopen(urllib.request.Request(href, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=15).read()
                    with open(fpath, 'wb') as f: f.write(pdf_data)
                    print(f"Saved {fname} ({len(pdf_data)} bytes)")
                break
    except Exception as e:
        print(f"Error {year} {kind}: {e}")
