import os
import io
import time
from pypdf import PdfReader
from PIL import Image

pdf_path = "data/official_exams/AMP_PARANA/AMP_2024_PROVA_GERAL.pdf"
reader = PdfReader(pdf_path)
total_pages = len(reader.pages)
print(f"Iniciando costura das {total_pages} páginas do PDF AMP 2024...")

os.makedirs("data/amp_2024_pages", exist_ok=True)

t0 = time.time()
for p_idx in range(total_pages):
    page = reader.pages[p_idx]
    slices = []
    for img in page.images:
        slices.append(Image.open(io.BytesIO(img.data)))
    
    if not slices:
        print(f"Página {p_idx+1}: Nenhuma imagem encontrada.")
        continue
    
    w = slices[0].size[0]
    total_h = sum(s.size[1] for s in slices)
    stitched = Image.new("RGB", (w, total_h))
    curr_y = 0
    for s in slices:
        stitched.paste(s, (0, curr_y))
        curr_y += s.size[1]
    
    out_path = f"data/amp_2024_pages/page_{p_idx+1:02d}.jpg"
    stitched.save(out_path, "JPEG", quality=85)
    print(f"Página {p_idx+1:02d}/{total_pages} salva: {stitched.size} em {out_path}")

print(f"Concluído em {(time.time() - t0):.2f}s")

