import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    'https://ucamp.org.br/',
    'https://www.amp.org.br/exame-amp',
    'https://med.estrategia.com/portal/provas-residencia-medica/prova-amp/'
]

found = set()
urls = [
    'https://amp.org.br/residencia-medica/exameamp/indexexamenovo.php',
    'https://ucamp.org.br/residencia-medica/530',
    'https://ucamp.org.br/residencia-medica/531',
    'https://ucamp.org.br/residencia-medica/532',
    'https://ucamp.org.br/residencia-medica/533',
    'https://ucamp.org.br/residencia-medica/534',
    'https://ucamp.org.br/residencia-medica/537'
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
        matches = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html, re.I)
        pdf_links = [m for m in matches if any(k in m.lower() for k in ['pdf', 'gabarito', 'prova'])]
        print(f"[{url}] Encontrados {len(pdf_links)} links de PDF/prova:")
        for p in set(pdf_links):
            print("   ->", p)
    except Exception as e:
        print(f"[{url}] Erro: {e}")
