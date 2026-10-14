import os, sys, requests, zipfile, io

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

targets = [
    # SUS-SP 2024
    ('data/official_exams/SUS_SP/SUS_SP_2024_GABARITO_DEFINITIVO.pdf', 
     'https://cdn.medblog.estrategiaeducacional.com.br/wp-content/uploads/2024/01/1_SES-SP_RM_2024_gabarito_definitivo.pdf'),
    # SUS-SP 2023
    ('data/official_exams/SUS_SP/SUS_SP_2023_GABARITO_DEFINITIVO.pdf', 
     'https://quadrix.org.br/uploads/861/concursos/1182/anexos/b8b12da4b37ee913a0ae0a637d695f63.pdf'),
    ('data/official_exams/SUS_SP/SUS_SP_2023_PROVAS.zip', 
     'https://anexos.cdn.selecao.net.br/uploads/861/concursos/1182/anexos/763b2f49-1479-49b8-bd9a-e420ff0edb6c.zip'),
    # SUS-SP 2022
    ('data/official_exams/SUS_SP/SUS_SP_2022_GABARITO_DEFINITIVO.pdf', 
     'https://quadrix.org.br/uploads/861/concursos/1216/anexos/36a1021561e5455c0901ed0cf92be6e8.pdf'),
    ('data/official_exams/SUS_SP/SUS_SP_2022_PROVAS.zip', 
     'https://anexos.cdn.selecao.net.br/uploads/861/concursos/1216/anexos/56189dfe-908a-458c-92a5-a74f2ad3c359.zip'),
    # IAMSPE
    ('data/official_exams/IAMSPE/IAMSPE_2023_GABARITO_DEFINITIVO.pdf', 
     'https://quadrix.org.br/uploads/861/concursos/1174/anexos/e46c5a89c69c65d037198187597de10b.pdf'),
    ('data/official_exams/IAMSPE/IAMSPE_2023_PROVAS.zip', 
     'https://anexos.cdn.selecao.net.br/uploads/861/concursos/1174/anexos/2cef8f92-dbba-487c-bd69-88d01b043de3.zip'),
    # Santa Casa SP
    ('data/official_exams/SANTA_CASA_SP/SANTA_CASA_2022_GABARITO_DEFINITIVO.pdf', 
     'https://quadrix.org.br/uploads/861/concursos/1214/anexos/679f1d4f4dbfaa8fd497c1ccac93fd17.pdf'),
]

print("="*80)
print("BAIXANDO GABARITOS E CADERNOS OFICIAIS: SUS-SP, IAMSPE E SANTA CASA")
print("="*80)

for dest_path, url in targets:
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1000:
        print(f"[OK Já Existe] {dest_path}")
        continue

    print(f"-> Baixando: {dest_path}...")
    try:
        r = requests.get(url, headers=headers, timeout=30)
        if r.status_code == 200 and len(r.content) > 1000:
            with open(dest_path, 'wb') as fp:
                fp.write(r.content)
            print(f"   Salvo: {len(r.content):,} bytes")
            
            # Se for ZIP, descompacta os PDFs
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

print("\nDownload concluído com sucesso!")
