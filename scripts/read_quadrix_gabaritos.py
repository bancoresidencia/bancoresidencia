import pypdf, sys, os

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

pdfs = [
    ('IAMSPE 2021', 'data/official_exams/IAMSPE/IAMSPE_2021_GABARITO_DEFINITIVO.pdf'),
    ('SANTA CASA 2019', 'data/official_exams/SANTA_CASA_SP/SANTA_CASA_2019_GABARITO_DEFINITIVO_CID1324.pdf'),
    ('SANTA CASA 2018', 'data/official_exams/SANTA_CASA_SP/SANTA_CASA_2018_GABARITO_DEFINITIVO_CID1372.pdf'),
]

for label, p in pdfs:
    print("=" * 80)
    print(f"{label}: {p}")
    print("=" * 80)
    if not os.path.exists(p):
        print("Arquivo nao encontrado!")
        continue
    reader = pypdf.PdfReader(p)
    print(f"Total de paginas: {len(reader.pages)}")
    for i, page in enumerate(reader.pages):
        txt = page.extract_text()
        print(f"\n--- PAGINA {i+1} ---")
        lines = [line.strip() for line in txt.split('\n') if line.strip()]
        for l in lines[:25]:
            print(f"  {l}")
