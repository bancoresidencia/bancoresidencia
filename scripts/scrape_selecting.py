import requests
import re

url = 'https://portal.concursos.selecting.com.br/edital/ver/43'
r = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
for m in re.finditer(r'href=[\'"](https://concursos\.selecting\.com\.br/arquivo\.php\?file=[^\'"]+)[\'"]', r.text):
    h = m.group(1)
    start = max(0, m.start() - 300)
    end = min(len(r.text), m.end() + 200)
    block = r.text[start:end]
    clean_block = re.sub(r'<[^>]+>', ' ', block)
    clean_block = re.sub(r'\s+', ' ', clean_block).strip()
    print('HREF:', h)
    print('TEXT:', clean_block)
    print('='*50)




