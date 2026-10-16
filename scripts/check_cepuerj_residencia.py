import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    'https://www.cepuerj.uerj.br/',
    'https://www.cepuerj.uerj.br/concursos.php',
    'https://www.cepuerj.uerj.br/concursos-anteriores.php',
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('latin1', errors='ignore')
        print(f"\n[{url}] HTML len: {len(html)}")
        links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
        for href, text in links:
            clean = re.sub(r'<[^>]+>', ' ', text).strip()
            if any(k in clean.lower() or k in href.lower() for k in ['resid', 'médic', 'medic', 'hupe']):
                print(f"   -> [{clean}] {href}")
    except Exception as e:
        print(f"Error {url}: {e}")
