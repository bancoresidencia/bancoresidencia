import requests, re, sys
sys.stdout.reconfigure(encoding='utf-8')
headers = {'User-Agent': 'Mozilla/5.0'}
r = requests.get('https://www.qconcursos.com/questoes-de-concursos/questoes/8b409d5d-e3', headers=headers)
print('Status:', r.status_code)
for line in r.text.splitlines():
    if any(k in line.lower() for k in ['ano:', 'banca:', 'órgão:', 'orgao:', 'prova:', 'santa casa', 'instituto mais']):
        clean = ' '.join(re.sub(r'<[^>]+>', ' ', line).split())
        if clean: print(clean)
