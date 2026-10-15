import requests, re, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
url = 'https://oldsite.amrigs.org.br/provas-anteriores/'

try:
    r = requests.get(url, headers=headers, timeout=15)
    print(f"Status: {r.status_code}")
    # find all links
    links = re.findall(r'href=["\']([^"\']+\.pdf)["\'][^>]*>(.*?)</a>', r.text, re.I)
    print(f"Total PDF links on oldsite: {len(links)}")
    for href, text in links:
        clean = re.sub(r'<[^>]+>', '', text).strip()
        print(f"  {clean} -> {href}")
except Exception as e:
    print(f"Error: {e}")
