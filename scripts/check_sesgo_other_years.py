import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    (2023, 'https://sistemas.institutoverbena.ufg.br/2022/ses-coreme/sistema/provas_gabaritos/provas_gabaritos_preliminares_coreme-ses-2023.html'),
    (2026, 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/Provas_gabaritos_preliminares_COREME_SES-2026-%23%24%23%24R.html')
]

for year, url in urls:
    try:
        html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
        print(f"\n=== SES-GO {year} ===")
        links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
        for href, text in links:
            clean = re.sub(r'<[^>]+>', ' ', text).strip()
            if any(k in clean.lower() or k in href.lower() for k in ['acesso direto', 'r1', 'prova', 'gabarito']):
                print(f"  [{clean}] -> {href}")
    except Exception as e:
        print(f"Error {year}: {e}")
