import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

base = 'https://www.cops.uel.br'

years = [2024, 2023, 2022, 2021, 2020]
tipos = ['C', 'R', 'V']

for y in years:
    for t in tipos:
        url = f"{base}/v2/Selecao/ListarSelecoes/ano/{y}/tipo/{t}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            html = urllib.request.urlopen(req, context=ctx, timeout=6).read().decode('latin1', errors='ignore')
            # Find all links to DetalharSelecao
            matches = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]*DetalharSelecao[^\'"]*)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
            for href, text in matches:
                clean_text = re.sub(r'\s+', ' ', text).strip()
                if any(k in clean_text.lower() for k in ['resid', 'médic', 'medic', 'hu']):
                    print(f"[{y}] {clean_text} -> {base}{href}")
        except Exception as e:
            pass
