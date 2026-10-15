import requests, re, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
url = 'https://www.fuvest.br/residencia-medica/'

try:
    r = requests.get(url, headers=headers, timeout=10)
    print(f"Status: {r.status_code}")
    # find links
    links = re.findall(r'href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', r.text, re.I)
    print(f"Total links on Fuvest residência: {len(links)}")
    for href, text in links:
        clean = re.sub(r'<[^>]+>', '', text).strip()
        if any(yr in clean or yr in href for yr in ['2021', '2022', '2020', '2019', '2018', '2017']):
            print(f"  {clean} -> {href}")
except Exception as e:
    print(f"Error: {e}")
