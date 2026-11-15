import pypdf

# Prova
reader_pv = pypdf.PdfReader('data/official_exams/SES_GO_2025/PV_PEDIATRIA_2025.pdf')
print('=== PV_PEDIATRIA_2025.pdf Page 3 ===')
print(reader_pv.pages[2].extract_text())

# Gabarito
reader_gb = pypdf.PdfReader('data/official_exams/SES_GO_2025/GB_PEDIATRIA_2025.pdf')
print('\n=== GB_PEDIATRIA_2025.pdf ===')
for page in reader_gb.pages:
    print(page.extract_text())
