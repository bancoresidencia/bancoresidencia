import requests, re, sys
from bs4 import BeautifulSoup

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

s = requests.Session()
s.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
})

for cid in [358]:
    url = f"https://www.fundatec.org.br/portal/concursos/publicacoes_v2.php?concurso={cid}"
    r = s.get(url)
    matches = re.findall(r"janelagrande\('([^']+)'\)", r.text)
    print(f"\n=== CID {cid} (Total {len(matches)} files) ===")
    for m in matches:
        print(f"  https://www.fundatec.org.br/portal/concursos/{m}")
