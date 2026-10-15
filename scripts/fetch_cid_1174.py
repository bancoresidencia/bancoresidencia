import requests, zipfile, io, os, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

urls = [
    'https://anexos.cdn.selecao.net.br/uploads/861/concursos/1174/anexos/2cef8f92-dbba-487c-bd69-88d01b043de3.zip',
    'https://anexos.cdn.selecao.net.br/uploads/861/concursos/1174/anexos/c7572e95-9d56-4081-a4f1-1d5159c5105e.zip'
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for idx, url in enumerate(urls):
    print(f"\n--- Baixando ZIP {idx+1}: {url} ---")
    r = requests.get(url, headers=headers, timeout=20)
    print(f"Status: {r.status_code}, Tamanho: {len(r.content)} bytes")
    if r.status_code == 200:
        z = zipfile.ZipFile(io.BytesIO(r.content))
        print(f"Arquivos no ZIP {idx+1}:")
        for name in z.namelist():
            print(f"  {name}")
            # If it has gabarito or acesso direto, extract to data/official_exams/IAMSPE/
            if any(k in name.lower() for k in ['gabarito', 'acesso', 'definitivo', 'caderno']):
                out_path = os.path.join('data', 'official_exams', 'IAMSPE', os.path.basename(name))
                with open(out_path, 'wb') as f:
                    f.write(z.read(name))
                print(f"    -> Extraído para {out_path}")
