import requests, re, sys, os
sys.stdout.reconfigure(encoding='utf-8')
headers = {'User-Agent': 'Mozilla/5.0'}

r = requests.get('https://www.institutomais.org.br/Concursos/Detalhe/512', headers=headers)
rows = re.findall(r'<tr>(.*?)</tr>', r.text, re.DOTALL | re.IGNORECASE)
for row in rows:
    clean = ' '.join(re.sub(r'<[^>]+>', ' ', row).split())
    links = re.findall(r'href=["\']([^"\']+)["\']', row)
    if links:
        print(clean, '->', links[0])

# Now download Gabaritos Definitivos
gab_url = 'https://www.institutomais.org.br/ckfinder/userfiles/files/PS_01_2023_SCSP_Comunicado_07_Divulga%c3%a7%c3%a3o_Gabaritos%20Definitivos.pdf'
resp = requests.get(gab_url, headers=headers)
os.makedirs('data/official_exams/SANTA_CASA_SP', exist_ok=True)
dest = 'data/official_exams/SANTA_CASA_SP/SANTA_CASA_2024_GABARITO_DEFINITIVO_INSTITUTO_MAIS.pdf'
with open(dest, 'wb') as f:
    f.write(resp.content)
print(f'Downloaded {len(resp.content)} bytes to {dest}')
