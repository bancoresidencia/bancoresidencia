import urllib.request, ssl, re, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://www.cepuerj.uerj.br/concursos2.php?concurso=S04597&ano=2024"
html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=8).read().decode('latin1', errors='ignore')
links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
print(f"Total links: {len(links)}")
for href, text in links[15:]:
    clean = re.sub(r'<[^>]+>', ' ', text).strip()
    print(f"  [{clean}] -> {href}")
