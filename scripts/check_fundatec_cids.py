import re
import urllib.request

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for cid in [358, 383, 407]:
    url = f'https://www.fundatec.org.br/portal/concursos/provas_anteriores.php?concurso={cid}'
    try:
        html = urllib.request.urlopen(urllib.request.Request(url, headers=headers)).read().decode('iso-8859-1', errors='ignore')
        print(f"=== PROVAS ANTERIORES CID {cid} ===")
        for m in re.finditer(r'href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.I | re.DOTALL):
            title = ' '.join(re.sub(r'<[^>]+>', ' ', m.group(2)).split())
            print(f"  {title} -> {m.group(1)}")
    except Exception as e:
        print(f"Error {cid}: {e}")
