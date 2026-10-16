import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://www.aremg.org.br/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
    links = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html)
    print(f"Total links on AREMG: {len(links)}")
    for l in sorted(set(links)):
        if any(k in l.lower() for k in ['processo', 'psu', 'prova', 'gabarito', 'edital', 'noticia', 'concurso']):
            print("  ", l)
except Exception as e:
    print("Error:", e)
