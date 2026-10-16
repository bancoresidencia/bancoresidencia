import urllib.request, ssl, re, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://portalfaurgs.com.br/concursos/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
print(f"HTML len: {len(html)}")

# Find all links mentioning HCPA, Residência, Médica
links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
print(f"Total links: {len(links)}")
for href, text in links:
    clean = re.sub(r'<[^>]+>', ' ', text).strip()
    if any(k in clean.lower() or k in href.lower() for k in ['hcpa', 'resid', 'porto alegre', 'clínicas']):
        print(f"  [{clean}] -> {href}")
