import requests, re, sys

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
url = 'https://quadrix.org.br/informacoes/1214/'
r = requests.get(url, headers=headers)
print('Status:', r.status_code)
links = re.findall(r'href="([^"]+)"', r.text)
for l in links:
    if any(k in l.lower() for k in ['pdf', 'zip', 'anexo', 'upload']):
        print(l)
