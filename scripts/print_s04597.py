import urllib.request, ssl, re, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://www.cepuerj.uerj.br/concursos2.php?concurso=S04597&ano=2027"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('latin1', errors='ignore')

links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
print(f"Total links on S04597: {len(links)}")
for href, text in links:
    clean = re.sub(r'<[^>]+>', ' ', text).strip()
    if any(k in clean.lower() or k in href.lower() for k in ['pdf', 'edital', 'prova', 'gabarito']):
        print(f"  [{clean}] -> {href}")
