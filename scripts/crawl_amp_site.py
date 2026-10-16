import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://ucamp.org.br/residencia-medica'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
    links = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html)
    print(f"Total links encontrados: {len(links)}")
    for l in sorted(set(links)):
        if any(k in l.lower() for k in ['residencia', 'prova', 'gabarito', 'exame', 'pdf', 'arquivo', 'edital']):
            print("  ", l)
except Exception as e:
    print('Error:', e)
