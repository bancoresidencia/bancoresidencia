import urllib.request, ssl, re, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

base = 'https://www.cepuerj.uerj.br/'

for ano in [2026, 2025, 2024, 2023, 2022, 2021]:
    url = f"{base}concursos2.php?concurso=S04597&ano={ano}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('latin1', errors='ignore')
        links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
        print(f"\n=== UERJ {ano} (Total links: {len(links)}) ===")
        for href, text in links:
            clean = re.sub(r'<[^>]+>', ' ', text).strip()
            if any(k in clean.lower() or k in href.lower() for k in ['prova', 'gabarito', 'caderno', 'definitivo']):
                full_href = href if href.startswith('http') else base + href
                print(f"  [{clean}] -> {full_href}")
    except Exception as e:
        print(f"Error {ano}: {e}")
