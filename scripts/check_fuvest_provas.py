import requests, re, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
urls = [
    'https://www.fuvest.br/residencia-medica-provas-e-gabarito/',
    'https://www.fuvest.br/acervo-residencia-medica/'
]

for url in urls:
    print(f"\n=== URL: {url} ===")
    r = requests.get(url, headers=headers)
    print(f"Status: {r.status_code}")
    links = re.findall(r'href=["\']([^"\']+\.pdf)["\'][^>]*>(.*?)</a>', r.text, re.I)
    for href, text in links:
        clean = re.sub(r'<[^>]+>', '', text).strip()
        print(f"  {clean} -> {href}")
