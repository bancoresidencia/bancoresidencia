import os, urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

out_dir = 'data/official_exams/PSU_MG'
os.makedirs(out_dir, exist_ok=True)

files = [
    ('PSU_MG_2024_GABARITO_PRELIMINAR_TIPO1.pdf', 'https://www.galaxcms.com.br/up_crud_comum/601/GABARITOPROVAGERALTIPO1PSU2024-20231203172436.pdf'),
    ('PSU_MG_2024_ALTERACAO_GABARITO_DEFINITIVO.pdf', 'https://www.galaxcms.com.br/up_crud_comum/601/AlteracaodeGabarito-PSUMG2024-20231222095320.pdf'),
    ('PSU_MG_2025_GABARITO_PRELIMINAR_TIPO1.pdf', 'https://www.galaxcms.com.br/up_crud_comum/601/GABARITOPRELIMINARPROVAGERALTIPO1-PSUMG2025-20241201170547.pdf'),
    ('PSU_MG_2025_ALTERACAO_GABARITO_DEFINITIVO.pdf', 'https://www.galaxcms.com.br/up_crud_comum/601/AlteracgabaritopsuMG2025-20241219200026.pdf'),
]

for fname, url in files:
    fpath = os.path.join(out_dir, fname)
    if not os.path.exists(fpath):
        print(f"Downloading {fname} from {url}...")
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        content = urllib.request.urlopen(req, context=ctx, timeout=15).read()
        with open(fpath, 'wb') as f:
            f.write(content)
        print(f"Saved {fname} ({len(content)} bytes)")
    else:
        print(f"Already exists: {fname}")
