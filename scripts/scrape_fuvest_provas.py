import requests, re, sys
sys.stdout.reconfigure(encoding='utf-8')
headers = {'User-Agent': 'Mozilla/5.0'}

r = requests.get('https://www.fuvest.br/acervo-residencia-coreme-sp/', headers=headers)
for l in re.findall(r'href=["\']([^"\']+)["\']', r.text):
    if any(k in l.lower() for k in ['2022', '2021', '2020', 'prova', 'caderno', 'gabarito']):
        print(l)
