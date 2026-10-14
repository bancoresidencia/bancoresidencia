import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request('https://www.fuvest.br/acervo-residencia-coreme-2023/', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
for l in sorted(set(re.findall(r'href=["\']([^"\']+\.pdf)["\']', html))):
    ll = l.lower()
    if any(k in ll for k in ['gabarito', 'prova', 'a1']):
        print(l)
