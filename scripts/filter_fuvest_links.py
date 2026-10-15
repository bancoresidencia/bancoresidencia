import requests, re, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
url = 'https://www.fuvest.br/residencia-medica/'

r = requests.get(url, headers=headers)
links = re.findall(r'href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', r.text, re.I)
for href, text in links:
    clean = re.sub(r'<[^>]+>', '', text).strip()
    if any(k in href.lower() or k in clean.lower() for k in ['prova', 'gabarito']) and any(yr in href or yr in clean for yr in ['2020', '2021', '2022', '2023']):
        print(f"{clean} -> {href}")
