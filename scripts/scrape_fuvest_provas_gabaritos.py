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
    c_low = clean.lower()
    h_low = href.lower()
    if any(k in c_low or k in h_low for k in ['direto', 'basica', 'básica', 'geral', 'r1', 'conhecimentos']):
        print(f"  [{clean}] -> {href}")
    elif 'gabarito' in h_low and ('geral' in h_low or 'r1' in h_low or 'retificado' in h_low):
        print(f"  GAB: [{clean}] -> {href}")
