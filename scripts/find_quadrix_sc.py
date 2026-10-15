import requests
import re
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

# Search quadrix concursos list for Santa Casa
print("Buscando concursos da Santa Casa na Quadrix...")
r = requests.get('https://quadrix.org.br/todos-os-concursos/encerrados.aspx', headers=headers)
html = r.text

matches = re.findall(r'href=[\'"]/informacoes/(\d+)/?[\'"][^>]*>(.*?)</a>', html, re.I | re.DOTALL)
print(f"Total concursos encerrados na lista: {len(matches)}")

sc_cids = []
for cid, title in matches:
    title_clean = ' '.join(re.sub(r'<[^>]+>', ' ', title).split())
    if any(k in title_clean.lower() for k in ['santa casa', 'fcmscsp', 'iscmsp', 'médica', 'residencia']):
        print(f"CID {cid}: {title_clean}")
        sc_cids.append((cid, title_clean))

# Check em andamento as well
r2 = requests.get('https://quadrix.org.br/todos-os-concursos/em-andamento.aspx', headers=headers)
matches2 = re.findall(r'href=[\'"]/informacoes/(\d+)/?[\'"][^>]*>(.*?)</a>', r2.text, re.I | re.DOTALL)
print(f"\nTotal concursos em andamento na lista: {len(matches2)}")
for cid, title in matches2:
    title_clean = ' '.join(re.sub(r'<[^>]+>', ' ', title).split())
    if any(k in title_clean.lower() for k in ['santa casa', 'fcmscsp', 'iscmsp', 'médica', 'residencia']):
        print(f"CID {cid}: {title_clean}")
        sc_cids.append((cid, title_clean))
