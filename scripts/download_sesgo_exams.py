import urllib.request, ssl, os, urllib.parse

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

out_dir = 'data/official_exams/SES_GO'
os.makedirs(out_dir, exist_ok=True)

base_2024 = 'https://sistemas.institutoverbena.ufg.br/2024/coreme-ses/sistema/provas_gabaritos/'

files = [
    ('SES_GO_2024_PROVA_ACESSO_DIRETO.pdf', base_2024 + urllib.parse.quote('prova/CADERNO DE PROVA - COREME - Areas Basicas e Especialidades de Acesso Direto (R1) 2024.pdf')),
    ('SES_GO_2024_GABARITO_DEFINITIVO.pdf', base_2024 + urllib.parse.quote('gabarito_final/Areas Basicas e Especialidades de Acesso Direto (R1) 2024.pdf'))
]

for fname, url in files:
    fpath = os.path.join(out_dir, fname)
    print(f"Downloading {fname} from {url}...")
    try:
        data = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=20).read()
        with open(fpath, 'wb') as f: f.write(data)
        print(f"Saved {fname} ({len(data)} bytes)")
    except Exception as e:
        print(f"Error {fname}: {e}")
