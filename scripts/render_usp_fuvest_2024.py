import os, pymupdf

pdf_path = 'data/official_exams/USP_FUVEST/USP_FUVEST_2024_PV.pdf'
out_dir = 'data/official_exams/USP_FUVEST/pages_2024'
os.makedirs(out_dir, exist_ok=True)

doc = pymupdf.open(pdf_path)
print(f"Renderizando {len(doc)} páginas de {pdf_path}...")
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    png_path = os.path.join(out_dir, f"page_{i+1:02d}.png")
    pix.save(png_path)

print(f"Salvas {len(doc)} páginas em {out_dir}")
