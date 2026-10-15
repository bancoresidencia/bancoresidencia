import requests, re, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for cid in [1371, 1372]:
    r = requests.get(f'https://quadrix.org.br/informacoes/{cid}/', headers=headers)
    links = re.findall(r'href=[\'"]([^\'"]+?\.(?:pdf|zip|rar)[^\'"]*?)[\'"][^>]*>(.*?)</a>', r.text, re.I | re.DOTALL)
    print(f"\n=== CID {cid} PROVAS E GABARITOS ===")
    for l, t in links:
        t_clean = ' '.join(re.sub(r'<[^>]+>', ' ', t).split())
        t_low = t_clean.lower()
        l_low = l.lower()
        if any(k in t_low or k in l_low for k in ['prova', 'caderno', 'gabarito definitivo']):
            print(f"  {t_clean}: {l}")
