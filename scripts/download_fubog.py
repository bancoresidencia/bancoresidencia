import os
import requests

os.makedirs('data/incoming_exams/FUBOG', exist_ok=True)

files = [
    {
        'name': 'data/incoming_exams/FUBOG/PV_FUBOG_VERSAO_1A.pdf',
        'url': 'https://concursos.selecting.com.br/arquivo.php?file=edital/1/43/648bcfe9891bb047b6ec4cb0fb473da8.pdf'
    },
    {
        'name': 'data/incoming_exams/FUBOG/GB_FUBOG_VERSAO_1A.pdf',
        'url': 'https://concursos.selecting.com.br/arquivo.php?file=edital/1/43/46b6af893d9faa4f3c3f54cf47120a5a.pdf'
    }
]

for f in files:
    print(f"Downloading {f['name']}...")
    r = requests.get(f['url'], headers={'User-Agent': 'Mozilla/5.0'}, timeout=20)
    print(f"Status: {r.status_code}, Length: {len(r.content)} bytes")
    if r.status_code == 200:
        with open(f['name'], 'wb') as fp:
            fp.write(r.content)
        print(f"Saved {f['name']}")
