import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    (2023, 'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-gabarito-preliminar-de-prova--psu-2023/1281'),
    (2022, 'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-gabarito-preliminar-de-prova--psu-2022/1128'),
]

for year, url in urls:
    html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
    links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
    print(f"\n=== {year} Links ===")
    for href, text in links:
        clean = re.sub(r'<[^>]+>', ' ', text).strip()
        if 'geral' in clean.lower() or 'geral' in href.lower():
            print(f"  [{clean}] -> {href}")
