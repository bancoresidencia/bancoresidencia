import pypdf
import os
import io
from PIL import Image

pdf_path = 'data/official_exams/AMP_PARANA/AMP_2024_PROVA_GERAL.pdf'
out_dir = 'data/temp_ocr_pages'
os.makedirs(out_dir, exist_ok=True)

reader = pypdf.PdfReader(pdf_path)
print(f"Total pages: {len(reader.pages)}")

# Extract page 1 image
page1 = reader.pages[1]
print(f"Images in page 1: {len(page1.images)}")
if len(page1.images) > 0:
    img = page1.images[0]
    out_file = os.path.join(out_dir, 'page_01.jpg')
    with open(out_file, 'wb') as f:
        f.write(img.data)
    print(f"Saved {out_file} ({os.path.getsize(out_file)} bytes)")

