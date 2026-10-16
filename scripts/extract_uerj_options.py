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
        html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=8).read().decode('latin1', errors='ignore')
        options = re.findall(r'<option[^>]*value=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</option>', html, re.DOTALL | re.IGNORECASE)
        print(f"\n=== UERJ {ano} Options ({len(options)}) ===")
        for val, text in options:
            clean = re.sub(r'<[^>]+>', ' ', text).strip()
            if any(k in clean.lower() or k in val.lower() for k in ['prova', 'gabarito', 'acesso direto', 'definitivo']):
                full_val = val if val.startswith('http') else base + val
                print(f"  [{clean}] -> {full_val}")
    except Exception as e:
        print(f"Error {ano}: {e}")
