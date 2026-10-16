import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

targets = [
    ('SES-GO (Verbena UFG)', 'https://sistemas.institutoverbena.ufg.br/'),
    ('SES-GO Portal', 'https://institutoverbena.ufg.br/'),
    ('UEL COPS Residencia', 'https://www.cops.uel.br/'),
    ('AREMG PSU-MG', 'https://www.aremg.org.br/'),
    ('CEPUERJ UERJ', 'https://www.cepuerj.uerj.br/'),
    ('FAURGS HCPA', 'https://portalfaurgs.com.br/concursos/')
]

for name, url in targets:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        res = urllib.request.urlopen(req, context=ctx, timeout=6)
        print(f"[OK {res.status}] {name} ({url}) - Length: {len(res.read())}")
    except Exception as e:
        print(f"[FAIL] {name} ({url}) -> {e}")
