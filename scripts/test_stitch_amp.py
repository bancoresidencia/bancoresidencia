import os
import io
from pypdf import PdfReader
from PIL import Image

pdf_path = "data/official_exams/AMP_PARANA/AMP_2024_PROVA_GERAL.pdf"
reader = PdfReader(pdf_path)

os.makedirs("data/amp_2024_pages", exist_ok=True)

for p_idx in [0, 1]:
    page = reader.pages[p_idx]
    slices = []
    for img in page.images:
        slices.append(Image.open(io.BytesIO(img.data)))
    if not slices:
        print(f"No images on page {p_idx}")
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
    print(f"Saved {out_path}: {stitched.size}")
