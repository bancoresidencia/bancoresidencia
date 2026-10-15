import requests, re, sys
from bs4 import BeautifulSoup

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

for cid in [358, 383, 407, 438, 476, 525, 573]:
    url = f"https://www.fundatec.org.br/portal/concursos/publicacoes_v2.php?concurso={cid}"
    r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    soup = BeautifulSoup(r.text, 'html.parser')
    print(f"\n=================== CID {cid} ===================")
    for a in soup.find_all('a'):
        href = a.get('href', '')
        text = ' '.join(a.get_text().split())
        t_low = text.lower()
        h_low = href.lower()
        if any(k in t_low or k in h_low for k in ['gabarito', 'caderno', 'prova', 'acesso direto']):
            print(f"  {text} -> {href}")
