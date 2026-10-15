import requests, re, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
url = 'https://www.fuvest.br/acervo-residencia-coreme-sp/'

r = requests.get(url, headers=headers)
print(f"Status: {r.status_code}")
links = re.findall(r'href=["\']([^"\']+\.pdf)["\'][^>]*>(.*?)</a>', r.text, re.I)
print(f"PDFs found: {len(links)}")
for href, text in links:
    clean = re.sub(r'<[^>]+>', '', text).strip()
    print(f"  {clean} -> {href}")

other_links = re.findall(r'href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', r.text, re.I)
for href, text in other_links:
    clean = re.sub(r'<[^>]+>', '', text).strip()
    if any(yr in clean or yr in href for yr in ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022']):
        print(f"  [PAGE] {clean} -> {href}")
