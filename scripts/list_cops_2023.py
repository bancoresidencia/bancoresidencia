import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://www.cops.uel.br/v2/Selecao/ListarSelecoes/ano/2023/tipo/C'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('latin1', errors='ignore')
    matches = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]*DetalharSelecao[^\'"]*)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
    print(f"Total selecoes 2023: {len(matches)}")
    for href, text in matches:
        print("  ", re.sub(r'\s+', ' ', text).strip(), "->", href)
except Exception as e:
    print("Error:", e)
