import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

candidates = [
    'https://www.aremg.org.br/processos-atuais',
    'https://www.aremg.org.br/processos-anteriores',
    'https://www.aremg.org.br/processos',
    'https://www.aremg.org.br/detalhes-do-processo',
    'https://www.aremg.org.br/psu'
]

for url in candidates:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, context=ctx, timeout=6)
        html = res.read().decode('utf-8', errors='ignore')
        print(f"[OK {res.status}] {url} -> len {len(html)}")
        links = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html)
        for l in set(links):
            if 'detalhes-do-processo' in l:
                print("   Process:", l)
    except Exception as e:
        print(f"[FAIL] {url} -> {e}")
