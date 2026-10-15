import requests, re, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
url = 'https://www.fuvest.br/residencia-medica/'

r = requests.get(url, headers=headers)
links = set(re.findall(r'href=["\'](https?://[^"\']+|/[^"\']+)["\']', r.text, re.I))
res_links = [l for l in links if 'residencia' in l.lower()]
for l in sorted(res_links)[:25]:
    print(l)
