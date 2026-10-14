import os, sys, requests, zipfile, io

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

targets = [
    # Santa Casa de SP 2023 (CID 1177)
    ('data/official_exams/SANTA_CASA_SP/SANTA_CASA_2023_GABARITO_DEFINITIVO.pdf',
     'https://quadrix.org.br/uploads/861/concursos/1177/anexos/9ce564c763866f7898c8d2f82f9979d0.pdf'),
    ('data/official_exams/SANTA_CASA_SP/SANTA_CASA_2023_PROVAS.zip',
     'https://anexos.cdn.selecao.net.br/uploads/861/concursos/1177/anexos/8a1ebffc-3a3d-4b55-9c1e-e1860d04cba8.zip'),
    
    # IAMSPE 2022 (CID 1213)
    ('data/official_exams/IAMSPE/IAMSPE_2022_GABARITO_DEFINITIVO.pdf',
     'https://quadrix.org.br/uploads/861/concursos/1213/anexos/a9ddf5796b73b95a8735832828e58b56.pdf'),
    ('data/official_exams/IAMSPE/IAMSPE_2022_PROVAS.zip',
     'https://anexos.cdn.selecao.net.br/uploads/861/concursos/1213/anexos/b01aba57-a623-495f-a7fb-bee37362171a.zip'),

    # Santa Casa de SP 2020 (CID 1297)
    ('data/official_exams/SANTA_CASA_SP/SANTA_CASA_2020_GABARITO_DEFINITIVO.pdf',
     'https://quadrix.org.br/uploads/861/concursos/1297/anexos/0a6001b9683ae55fe42437d9248f3086.pdf'),
    ('data/official_exams/SANTA_CASA_SP/SANTA_CASA_2020_PROVAS.zip',
     'https://anexos.cdn.selecao.net.br/uploads/861/concursos/1297/anexos/ef6c7021-8f3c-4cfd-af24-86a494c72e76.zip')
]

print("="*80)
print("BAIXANDO CADERNOS E GABARITOS OFICIAIS DEFINITIVOS:")
print("Santa Casa 2023, Santa Casa 2020, IAMSPE 2022")
print("="*80)

for dest_path, url in targets:
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1000:
        print(f"[OK Já Existe] {dest_path}")
        continue

    print(f"-> Baixando: {dest_path}...")
    try:
        r = requests.get(url, headers=headers, timeout=60)
        if r.status_code == 200 and len(r.content) > 1000:
            with open(dest_path, 'wb') as fp:
                fp.write(r.content)
            print(f"   Salvo: {len(r.content):,} bytes")
            
            if dest_path.endswith('.zip'):
                z = zipfile.ZipFile(io.BytesIO(r.content))
                extract_dir = os.path.splitext(dest_path)[0]
                os.makedirs(extract_dir, exist_ok=True)
                z.extractall(extract_dir)
                print(f"   Descompactado em {extract_dir}: {len(z.namelist())} arquivos")
        else:
            print(f"   Falha HTTP {r.status_code} ({len(r.content)} bytes)")
    except Exception as e:
        print(f"   Erro ao baixar {url}: {e}")

print("\nConcluído com sucesso!")
