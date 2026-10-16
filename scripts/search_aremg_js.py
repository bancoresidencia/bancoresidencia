import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

js = urllib.request.urlopen(urllib.request.Request('https://www.aremg.org.br/js/geral.js', headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=8).read().decode('utf-8', errors='ignore')

# Search for any ajax or selector
for match in re.finditer(r'campo-selecao-ano|\.change|\$\.ajax|\$\.post|\$\.get', js):
    start = max(0, match.start() - 100)
    end = min(len(js), match.end() + 250)
    print("--- MATCH ---")
    print(js[start:end])
