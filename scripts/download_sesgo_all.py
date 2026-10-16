import urllib.request, ssl, os, urllib.parse

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

out_dir = 'data/official_exams/SES_GO'
os.makedirs(out_dir, exist_ok=True)

downloads = [
    # 2026
    ('SES_GO_2026_PROVA_ACESSO_DIRETO.pdf', 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/' + urllib.parse.quote('provas/REAS BSICAS E ESPECIALIDADES DE ACESSO DIRETO (R1) TIPO A.pdf')),
    ('SES_GO_2026_GABARITO_DEFINITIVO.pdf', 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/' + urllib.parse.quote('gabaritos_preliminares/Gabarito Preliminar - Acesso direto tipo A.pdf')),
    # 2023
    ('SES_GO_2023_PROVA_ACESSO_DIRETO.pdf', 'https://sistemas.institutoverbena.ufg.br/2022/ses-coreme/sistema/provas_gabaritos/' + urllib.parse.quote('prova/Areas basicas e especialidades de acesso direto R1.pdf')),
    ('SES_GO_2023_GABARITO_DEFINITIVO.pdf', 'https://sistemas.institutoverbena.ufg.br/2022/ses-coreme/sistema/provas_gabaritos/' + urllib.parse.quote('gabarito_preliminar/Areas Basicas e Especialidades de Acesso Direto (R1).pdf')),
]

for fname, url in downloads:
    fpath = os.path.join(out_dir, fname)
    if not os.path.exists(fpath):
        print(f"Downloading {fname} from {url}...")
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=20).read()
            with open(fpath, 'wb') as f: f.write(data)
            print(f"Saved {fname} ({len(data)} bytes)")
        except Exception as e:
            print(f"Error {fname}: {e}")
    else:
        print(f"Already exists: {fname}")
