import os, requests, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

downloads = [
    # IAMSPE 2021 (CID 1242)
    ('data/official_exams/IAMSPE/IAMSPE_2021_GABARITO_DEFINITIVO.pdf',
     'https://quadrix.org.br/uploads/861/concursos/1242/anexos/49cad69499b6cffa1e0aae1639f0b914.pdf'),
    ('data/official_exams/IAMSPE/IAMSPE_2021_PROVAS.rar',
     'https://anexos.cdn.selecao.net.br/uploads/861/concursos/1242/anexos/5f8b9ff0-fb9d-4441-96fc-4b55ea078c22.rar'),
     
    # SANTA CASA 2021 (CID 1243)
    ('data/official_exams/SANTA_CASA_SP/SANTA_CASA_2021_GABARITO_DEFINITIVO_CID1243.pdf',
     'https://quadrix.org.br/uploads/861/concursos/1243/anexos/7c57788ba8610ebb140bc52836a35058.pdf'),
    ('data/official_exams/SANTA_CASA_SP/SANTA_CASA_2021_PROVAS_CID1243.rar',
     'https://anexos.cdn.selecao.net.br/uploads/861/concursos/1243/anexos/54feb6e5-74dd-4147-bbf6-0e23c3a64ecf.rar'),

    # SANTA CASA 2020 / 2019 (CID 1297)
    ('data/official_exams/SANTA_CASA_SP/SANTA_CASA_2020_GABARITO_DEFINITIVO_CID1297.pdf',
     'https://quadrix.org.br/uploads/861/concursos/1297/anexos/0a6001b9683ae55fe42437d9248f3086.pdf'),
    ('data/official_exams/SANTA_CASA_SP/SANTA_CASA_2020_PROVAS_CID1297.zip',
     'https://anexos.cdn.selecao.net.br/uploads/861/concursos/1297/anexos/ef6c7021-8f3c-4cfd-af24-86a494c72e76.zip'),

    # SANTA CASA 2019 / 2018 (CID 1324)
    ('data/official_exams/SANTA_CASA_SP/SANTA_CASA_2019_GABARITO_DEFINITIVO_CID1324.pdf',
     'https://quadrix.org.br/uploads/861/concursos/1324/anexos/6e9e4c9e1ce56c2efdcd39f830fe3815.pdf'),
    ('data/official_exams/SANTA_CASA_SP/SANTA_CASA_2019_PV_ACESSO_DIRETO_CID1324.pdf',
     'https://quadrix.org.br/uploads/861/concursos/1324/anexos/fd768242aff1158b08f1b4cdb0ca70e4.pdf'),
]

for dest, url in downloads:
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if os.path.exists(dest) and os.path.getsize(dest) > 1000:
        print(f"[OK Ja Existe] {dest} ({os.path.getsize(dest):,} bytes)")
        continue
    print(f"Baixando: {dest} <- {url}")
    try:
        r = requests.get(url, headers=headers, timeout=30)
        if r.status_code == 200 and len(r.content) > 1000:
            with open(dest, 'wb') as fp:
                fp.write(r.content)
            print(f"  -> Salvo com sucesso! {len(r.content):,} bytes")
        else:
            print(f"  -> Falha: Status {r.status_code}, tamanho {len(r.content)} bytes")
    except Exception as e:
        print(f"  -> Erro: {e}")
