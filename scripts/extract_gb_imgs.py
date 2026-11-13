import io
from pypdf import PdfReader
from PIL import Image

pdf_path = "data/official_exams/AMP_PARANA/GB_AMP_2024_OFICIAL.pdf"
reader = PdfReader(pdf_path)
print(f"Total pages in GB: {len(reader.pages)}")

# Let's extract any images or check text
for i, page in enumerate(reader.pages):
    print(f"Page {i+1} images: {len(page.images)}")
    for j, img in enumerate(page.images):
        with open(f"data/gb_p{i+1}_img{j+1}.png", "wb") as f:
            f.write(img.data)
        print(f"  Saved data/gb_p{i+1}_img{j+1}.png")

