import os
from pypdf import PdfReader
from PIL import Image

pdf_path = "data/official_exams/AMP_PARANA/AMP_2024_PROVA_GERAL.pdf"
reader = PdfReader(pdf_path)
print(f"Total pages: {len(reader.pages)}")

page0 = reader.pages[0]
print(f"Images in page 0: {len(page0.images)}")
for i, img in enumerate(page0.images):
    print(f"  Img {i}: {img.name}, size: {len(img.data)} bytes")
    # Save first image to inspect
    with open("data/test_p0_img.png", "wb") as f:
        f.write(img.data)
    im = Image.open("data/test_p0_img.png")
    print(f"  Dimensions: {im.size}, mode: {im.mode}")

