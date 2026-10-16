import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-alteracao-de-gabaritos-apos-analise-de-recursos--psu-mg-2025/1760',
    'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-gabarito-preliminar-de-prova--psu-mg-2025/1748'
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
        print(f"\n[{url}]")
        links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
        for href, text in links:
            clean = re.sub(r'<[^>]+>', ' ', text).strip()
            if any(k in href.lower() or k in clean.lower() for k in ['pdf', 'gabarito', 'prova', 'download', 'upload', 'arquivos']):
                print(f"   -> [{clean}] {href}")
    except Exception as e:
        print(f"Error {url}: {e}")
