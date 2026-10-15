import requests, re, sys
sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

r = requests.get('https://www.fuvest.br/acervo-residencia-coreme-sp/', headers=headers)
print('Status FUVEST Acervo:', r.status_code)
links = re.findall(r'href=[\'"]([^\'"]+?)[\'"][^>]*>(.*?)</a>', r.text, re.DOTALL)
for l, t in links:
    t_clean = ' '.join(re.sub(r'<[^>]+>', ' ', t).split())
    if any(k in t_clean.lower() or k in l.lower() for k in ['coreme', 'residencia', '202', '201']):
        print(f"{t_clean}: {l}")
