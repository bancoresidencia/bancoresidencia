import urllib.request, ssl, re, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

base = 'https://www.cepuerj.uerj.br/'

for ano in [2021, 2020, 2018]:
    url = f"{base}concursos2.php?concurso=S04597&ano={ano}"
    html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=8).read().decode('latin1', errors='ignore')
    options = re.findall(r'<option[^>]*value=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</option>', html, re.DOTALL | re.IGNORECASE)
    print(f"\n=== UERJ {ano} Options ({len(options)}) ===")
    for val, text in options:
        clean = re.sub(r'<[^>]+>', ' ', text).strip()
        print(f"  [{clean}] -> {val}")
