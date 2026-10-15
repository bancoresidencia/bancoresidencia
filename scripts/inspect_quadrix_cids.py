import requests, re, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

cids = [1090, 1129, 1177, 1213, 1240, 1241, 1243, 1297, 1371]
for cid in cids:
    r = requests.get(f'https://quadrix.org.br/informacoes/{cid}/', headers={'User-Agent': 'Mozilla/5.0'})
    h2 = re.findall(r'<h2[^>]*>(.*?)</h2>', r.text, re.I | re.DOTALL)
    title = ' '.join(re.sub(r'<[^>]+>', ' ', h2[0] if h2 else '').split())
    links = re.findall(r'href=[\'"]([^\'"]+?\.(?:pdf|zip|rar)[^\'"]*?)[\'"][^>]*>(.*?)</a>', r.text, re.I | re.DOTALL)
    gab_links = []
    prova_links = []
    for l, t in links:
        t_clean = ' '.join(re.sub(r'<[^>]+>', ' ', t).split())
        t_low = t_clean.lower()
        if 'gabarito' in t_low:
            gab_links.append((t_clean, l))
        if 'prova' in t_low or 'caderno' in t_low:
            prova_links.append((t_clean, l))
    
    years = set(re.findall(r'201[4-9]|202[0-6]', r.text[:5000]))
    print(f"\n=== CID {cid}: {title} (Years: {sorted(years)}) ===")
    for t, l in gab_links[:3]:
        print(f"  GAB: {t} -> {l}")
    for t, l in prova_links[:2]:
        print(f"  PRV: {t} -> {l}")
