import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://sistemas.institutoverbena.ufg.br/2024/coreme-ses/sistema/provas_gabaritos/provas_gabaritos_finais%20coreme-ses-2024.html'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
print(f"HTML len: {len(html)}")

links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
for href, text in links:
    clean = re.sub(r'<[^>]+>', ' ', text).strip()
    print(f"  [{clean}] -> {href}")
