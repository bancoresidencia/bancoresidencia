import re
import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    'https://www.resmedceara.ufc.br/ares/processos-seletivos-anteriores-resmed',
    headers={'User-Agent': 'Mozilla/5.0'}
)
html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')

all_pdfs = re.findall(r'href=["\'](https?://[^"\']+\.pdf)["\']', html)
print(f"Total PDFs extraídos: {len(all_pdfs)}")

provas_e_gabaritos = []
for p in all_pdfs:
    name = p.split('/')[-1].lower()
    if ('prova' in name or 'gabarito' in name or 'caderno' in name) and not 'recurso' in name:
        provas_e_gabaritos.append(p)

print(f"\nProvas e gabaritos relevantes encontrados: {len(provas_e_gabaritos)}")
for p in set(provas_e_gabaritos):
    print("  ->", p)

