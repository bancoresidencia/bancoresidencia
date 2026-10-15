import requests, re, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for yr in [2021, 2022, 2023, 2024, 2025]:
    url = f'https://www.fuvest.br/residencia-medica-{yr}/'
    r = requests.get(url, headers=headers)
    print(f"Year {yr} ({url}) -> Status: {r.status_code}")
    if r.status_code == 200:
        links = re.findall(r'href=["\']([^"\']+\.pdf)["\'][^>]*>(.*?)</a>', r.text, re.I)
        for href, text in links:
            clean = re.sub(r'<[^>]+>', '', text).strip()
            if any(k in href.lower() or k in clean.lower() for k in ['prova', 'gabarito']):
                print(f"  {clean} -> {href}")
