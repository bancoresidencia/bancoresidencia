import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

candidates = [
    'https://ucamp.org.br/pdf/gabaritos/gabarito-2024.pdf',
    'https://ucamp.org.br/pdf/provas/prova-2024.pdf',
    'https://ucamp.org.br/pdf/provas/geral-2024.pdf',
    'https://ucamp.org.br/pdf/provas/acesso-direto-2024.pdf',
    'https://ucamp.org.br/pdf/editais/gabarito-2024.pdf',
    'https://ucamp.org.br/pdf/editais/gabarito-definitivo-2024.pdf',
    'https://ucamp.org.br/pdf/gabarito-definitivo-2024.pdf',
    'https://ucamp.org.br/pdf/gabarito-2024.pdf',
    'https://amp.org.br/residencia-medica/provas-anteriores',
    'https://amp.org.br/residencia-medica/gabaritos',
    'https://exameamp-app.amp.org.br/'
]

for url in candidates:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        res = urllib.request.urlopen(req, context=ctx, timeout=5)
        print(f"[OK {res.status}] {url} - Type: {res.headers.get('Content-Type')}, Length: {res.headers.get('Content-Length')}")
    except Exception as e:
        # print(f"[FAIL] {url} -> {e}")
        pass
