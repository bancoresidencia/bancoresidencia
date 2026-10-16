import urllib.request, ssl, re, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://www.faurgs.com.br/hospital-de-clinicas-de-porto-alegre-hcpa/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
print(f"HTML len: {len(html)}")

links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
print(f"Total links: {len(links)}")
for href, text in links:
    clean = re.sub(r'<[^>]+>', ' ', text).strip()
    if any(k in clean.lower() or k in href.lower() for k in ['resid', 'médic', 'prova', 'gabarito', 'edital', 'concurso']):
        print(f"  [{clean}] -> {href}")
