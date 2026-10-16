import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Check all links from process 70 and 81
urls = [
    'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-gabaritos-definitivos-apos-analise-de-recursos--psu-mg-2024/1531',
    'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-gabarito-preliminar-de-prova--psu-2024/1522',
    'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-alteracao-de-gabaritos-apos-analise-de-recursos--psu-mg-2025/1760',
    'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-gabarito-preliminar-de-prova--psu-mg-2025/1748'
]

for url in urls:
    html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
    # find all a href with galaxcms or arquivos
    files = re.findall(r'href=[\'"]([^\'"]*(?:galaxcms|arquivo|\.pdf)[^\'"]*)[\'"]', html, re.I)
    print(f"\n[{url}] Files:")
    for f in set(files):
        print("   ", f)
