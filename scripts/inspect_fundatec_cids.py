import requests, re, sys
from bs4 import BeautifulSoup

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

cids = [315, 358, 383, 407, 438, 476, 505, 525, 568, 573, 594]
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for cid in cids:
    url = f"https://www.fundatec.org.br/portal/concursos/publicacoes_v2.php?concurso={cid}"
    r = requests.get(url, headers=headers)
    links = re.findall(r'href=[\'"]([^\'"]+?\.pdf)[\'"][^>]*>(.*?)</a>', r.text, re.I | re.DOTALL)
    soup = BeautifulSoup(r.text, 'html.parser')
    header_text = ''
    for el in soup.find_all(['h1', 'h2', 'h3', 'h4', 'strong', 'b', 'title']):
        t = el.get_text().strip()
        if 'amrigs' in t.lower() or 'exame' in t.lower() or 'médic' in t.lower():
            header_text = t
            break
    print(f"\n=== FUNDATEC CID {cid}: {header_text} ===")
    for l, t in links:
        t_clean = ' '.join(re.sub(r'<[^>]+>', ' ', t).split())
        t_low = t_clean.lower()
        if 'gabarito' in t_low and ('definitivo' in t_low or 'oficial' in t_low):
            print(f"  GAB: {t_clean} -> {l}")
        elif ('caderno' in t_low or 'prova' in t_low) and ('acesso direto' in t_low or 'autoavalia' in t_low):
            print(f"  PRV: {t_clean} -> {l}")
