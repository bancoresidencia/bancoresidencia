import pypdf

reader = pypdf.PdfReader('data/official_exams/AMP_PARANA/AMP_2024_PROVA_GERAL.pdf')
for p_idx in [1, 2, 3]:
    page = reader.pages[p_idx]
    print(f"\n--- Page {p_idx} (total images: {len(page.images)}) ---")
    for i, img in enumerate(page.images):
        print(f"  Img {i}: {img.name}, size={len(img.data)} bytes")

