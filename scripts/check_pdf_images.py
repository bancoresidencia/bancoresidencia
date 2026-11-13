import pypdf

reader = pypdf.PdfReader('data/official_exams/AMP_PARANA/AMP_2024_PROVA_GERAL.pdf')
print(f"Total pages in AMP 2024: {len(reader.pages)}")
page0 = reader.pages[0]
print("Text on page 0:", repr(page0.extract_text()))
print("Images on page 0:", len(page0.images))
if len(page0.images) > 0:
    print("Page 0 has image:", page0.images[0].name)

