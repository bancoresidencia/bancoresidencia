import urllib.request, ssl, re, urllib.parse

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/Provas_gabaritos_preliminares_COREME_SES-2026-%23%24%23%24R.html'
raw_bytes = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=8).read()

# Find href with regex on raw bytes
matches = re.findall(rb'href=[\'"]([^\'"]*TIPO%20A\.pdf|[^\'"]*TIPO A\.pdf)[\'"]', raw_bytes)
for m in matches:
    # Try requesting
    m_str = m.decode('latin1')
    quoted = urllib.parse.quote(m_str, safe='/%')
    full = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/' + quoted
    print("Trying:", full)
    try:
        data = urllib.request.urlopen(urllib.request.Request(full, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=10).read()
        print(f"SUCCESS! {len(data)} bytes")
        with open('data/official_exams/SES_GO/SES_GO_2026_PROVA_ACESSO_DIRETO.pdf', 'wb') as f:
            f.write(data)
        break
    except Exception as e:
        print("FAIL:", e)
