import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    'https://sistemas.institutoverbena.ufg.br/portal/concursos/',
    'https://sistemas.institutoverbena.ufg.br/portal/concursos/encerrados',
    'https://sistemas.institutoverbena.ufg.br/portal/busca?q=coreme',
    'https://sistemas.institutoverbena.ufg.br/portal/busca?q=residencia+medica'
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, context=ctx, timeout=8)
        html = res.read().decode('utf-8', errors='ignore')
        print(f"[{url}] status {res.status}, len: {len(html)}")
        links = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html)
        for l in set(links):
            if any(k in l.lower() for k in ['coreme', 'ses-go', 'residencia']):
                print("   Found:", l)
    except Exception as e:
        print(f"[{url}] err: {e}")
