import re
import urllib.request

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
url = 'https://www.vunesp.com.br/busca?q=residencia+medica'
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    
    links = set(re.findall(r'href=[\'"]([^\'"]+)[\'"]', html))
    print(f"Total links on search: {len(links)}")
    for l in sorted(links):
        ll = l.lower()
        if any(k in ll for k in ['sssp', 'saude', 'residencia', 'medica']):
            print(f"  {l}")
except Exception as e:
    print("Error:", e)
