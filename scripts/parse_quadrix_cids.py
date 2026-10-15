import requests, re, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

cids = [1090, 1129, 1177, 1213]

for cid in cids:
    url = f'https://quadrix.org.br/informacoes/{cid}/'
    try:
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code == 200:
            h1_h2 = re.findall(r'<h[12]>(.*?)</h[12]>', r.text, re.I)
            inst = ' - '.join([x.strip() for x in h1_h2 if x.strip()])
            
            # Find year mentions
            years = set(re.findall(r'\b(201\d|202\d)\b', r.text))
            
            # Find links
            links = re.findall(r'href=[\'"]([^\'"]+?\.(?:pdf|zip|rar)[^\'"]*?)[\'"][^>]*>(.*?)</a>', r.text, re.I | re.DOTALL)
            
            print(f"\n=======================================================")
            print(f"CID {cid}: {inst}")
            print(f"Anos citados na pagina: {sorted(years)}")
            print(f"Total links (pdf/zip/rar): {len(links)}")
            
            interesting = []
            for l, t in links:
                t_clean = ' '.join(re.sub(r'<[^>]+>', ' ', t).split())
                l_lower = l.lower()
                t_lower = t_clean.lower()
                if any(k in t_lower or k in l_lower for k in ['gabarito', 'prova', 'caderno', 'definitivo']):
                    interesting.append((t_clean, l))
            
            print(f"Links relevantes ({len(interesting)}):")
            for t_clean, l in interesting[:10]:
                print(f"  * [{t_clean}] -> {l}")
    except Exception as e:
        print(f"Erro no CID {cid}: {e}")
