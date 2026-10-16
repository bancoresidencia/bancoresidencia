import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-gabarito-preliminar-de-prova--psu-2022/1128'
html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
for href, text in links:
    clean = re.sub(r'<[^>]+>', ' ', text).strip()
    if 'pdf' in href.lower() or 'pdf' in clean.lower():
        print(f"[{clean}] -> {href}")
