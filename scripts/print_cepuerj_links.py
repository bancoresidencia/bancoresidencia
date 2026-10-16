import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://www.cepuerj.uerj.br/concursos.php'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('latin1', errors='ignore')
links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
print(f"Total links on concursos.php: {len(links)}")
for href, text in links:
    clean = re.sub(r'<[^>]+>', ' ', text).strip()
    print(f"  [{clean}] -> {href}")
