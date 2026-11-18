import requests
import re

url = 'https://portal.concursos.selecting.com.br/edital/ver/42'
r = requests.get(url, timeout=5, headers={'User-Agent': 'Mozilla/5.0'})
files = re.findall(r'href=[\'"](https://concursos\.selecting\.com\.br/arquivo\.php\?file=[^\'"]+)[\'"]', r.text)
print('Total arquivos em 42:', len(files))
for f_url in files:
    idx = r.text.find(f_url)
    block = r.text[max(0, idx-400):idx]
    clean = re.sub(r'<[^>]+>', ' ', block)
    clean = re.sub(r'\s+', ' ', clean).strip()
    if any(k in clean.upper() for k in ['GABARITO', 'PROVA', 'CADERNO', 'VERSÃO']):
        print('TITLE:', clean[-120:])
        print('URL:  ', f_url)
        print('-'*50)



