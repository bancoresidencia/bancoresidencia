import urllib.request, os

years = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

patterns = [
    'rm{y}-prova-AD1-areasbasicas-acessodireto.pdf',
    'rm{y}-prova-AD1-areasbasicas-acessodireto-v2.pdf',
    'rm{y}-gabarito-AD-areasbasicas-acessodireto-retificado.pdf',
    'rm{y}-gabarito-AD-areasbasicas-acessodireto.pdf',
    'rm{y}_prova_AD1.pdf',
    'rm{y}_gabarito_AD.pdf',
    'prova-AD1-areasbasicas-acessodireto-{y}.pdf',
    'gabarito-AD-areasbasicas-acessodireto-{y}.pdf',
    'rm{y}-prova-AD1.pdf',
    'rm{y}-gabarito-AD.pdf'
]

found_urls = []
for y in years:
    for pat in patterns:
        filename = pat.format(y=y)
        url = f"https://www.fuvest.br/wp-content/uploads/{filename}"
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=4) as resp:
                if resp.status == 200:
                    size = resp.headers.get('content-length', 0)
                    print(f"FOUND: {y} -> {filename} ({size} bytes)")
                    found_urls.append((y, filename, url))
        except:
            pass

print(f"\nTotal FUVEST PDFs found: {len(found_urls)}")
