import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

base = 'https://www.cops.uel.br'

ids = [
    (2024, 325),
    (2023, 296),
    (2022, 280),
    (2021, 255),
    (2020, 245)
]

for year, sid in ids:
    url = f"{base}/v2/Selecao/DetalharSelecao/Selecao/{sid}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('latin1', errors='ignore')
        # Title of selection
        title_m = re.search(r'<title>(.*?)</title>', html, re.I)
        h_m = re.search(r'<h3>(.*?)</h3>', html, re.I)
        title = h_m.group(1) if h_m else (title_m.group(1) if title_m else '')
        print(f"\n[ID {sid} - {year}] {re.sub(r'<[^>]+>', '', title).strip()}")
        
        # Look for PDF links
        links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
        for href, text in links:
            clean_text = re.sub(r'\s+', ' ', text).strip()
            if any(k in clean_text.lower() or k in href.lower() for k in ['prova', 'gabarito', 'definitivo']):
                print(f"   -> {clean_text} | {href}")
    except Exception as e:
        print(f"Error {sid}: {e}")
