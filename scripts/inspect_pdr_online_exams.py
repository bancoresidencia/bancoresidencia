import sys
sys.path.append('scripts/coletor_provaderesidencia')
import config
import requests
from bs4 import BeautifulSoup
import re

s = requests.Session()
s.headers.update(config.HEADERS)
s.cookies.update(config.COOKIES)

r = s.get('https://provaderesidencia.com.br/premium/banco-de-provas', timeout=15)
soup = BeautifulSoup(r.text, 'html.parser')

print("Título da página:", soup.title.string if soup.title else "Sem título")

# Procurar links para /premium/prova/
links = soup.find_all('a', href=re.compile(r'/premium/prova/\d+/'))
print(f"Total de links de prova encontrados na página principal: {len(links)}")

print("\nPrimeiros 10 links de provas:")
for l in links[:10]:
    print(f" - [{l['href']}] {l.get_text(strip=True)}")

