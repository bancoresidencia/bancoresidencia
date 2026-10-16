import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Test variations of concurso code for Residência Médica UERJ
# 2027 is S04597 -> Maybe 2026 is S04596, 2025 is S04595, 2024 is S04594, 2023 is S04593?
years_codes = [
    (2027, 'S04597'),
    (2026, 'S04596'),
    (2025, 'S04595'),
    (2024, 'S04594'),
    (2023, 'S04593'),
    (2022, 'S04592'),
    (2021, 'S04591'),
]

for year, code in years_codes:
    url = f"https://www.cepuerj.uerj.br/concursos2.php?concurso={code}&ano={year}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('latin1', errors='ignore')
        # Title or heading
        title_m = re.search(r'<h[1-4][^>]*>(.*?)</h[1-4]>', html, re.I | re.DOTALL)
        title = re.sub(r'<[^>]+>', '', title_m.group(1)).strip() if title_m else 'No title'
        print(f"\n[{year} - {code}] {title} (len: {len(html)})")
        
        # Check files
        links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
        for href, text in links:
            clean = re.sub(r'<[^>]+>', ' ', text).strip()
            if any(k in clean.lower() or k in href.lower() for k in ['prova', 'gabarito', 'caderno', 'definitivo', '.pdf']):
                print(f"   -> [{clean}] {href}")
    except Exception as e:
        print(f"Error {year} {code}: {e}")
