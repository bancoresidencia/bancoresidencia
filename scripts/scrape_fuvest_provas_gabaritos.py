import requests, re, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
url = 'https://www.fuvest.br/residencia-medica-provas-e-gabarito/'

r = requests.get(url, headers=headers)
print(f"Status: {r.status_code}")

# Find all links
links = re.findall(r'href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', r.text, re.I)
print(f"Total links: {len(links)}")

for href, text in links:
    clean = re.sub(r'<[^>]+>', '', text).strip()
    if any(k in href.lower() or k in clean.lower() for k in ['prova', 'gabarito', 'acesso', 'definitivo']):
        print(f"  [{clean}] -> {href}")
