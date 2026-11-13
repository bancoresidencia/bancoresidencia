import os
import glob
from pypdf import PdfReader

folders = glob.glob('data/official_exams/*')
inventory = []

for folder in folders:
    if not os.path.isdir(folder): continue
    banca_name = os.path.basename(folder)
    pdfs = glob.glob(f"{folder}/*.pdf")
    pvs = [p for p in pdfs if 'pv' in os.path.basename(p).lower() or 'prova' in os.path.basename(p).lower() or 'caderno' in os.path.basename(p).lower()]
    gbs = [p for p in pdfs if 'gb' in os.path.basename(p).lower() or 'gabarito' in os.path.basename(p).lower()]
    
    total_size_mb = sum(os.path.getsize(p) for p in pdfs) / (1024 * 1024)
    inventory.append({
        'banca': banca_name,
        'total_pdfs': len(pdfs),
        'provas': len(pvs),
        'gabaritos': len(gbs),
        'size_mb': round(total_size_mb, 2),
        'arquivos': [os.path.basename(p) for p in pdfs]
    })

print(f"Total bancas locais com PDFs: {len(inventory)}")
for item in sorted(inventory, key=lambda x: -x['total_pdfs']):
    print(f"\n📂 {item['banca']}: {item['total_pdfs']} PDFs ({item['provas']} Provas, {item['gabaritos']} Gabaritos) | {item['size_mb']} MB")
    for f in item['arquivos'][:6]:
        print(f"   - {f}")
    if len(item['arquivos']) > 6:
        print(f"   ... e mais {len(item['arquivos']) - 6} arquivos")

