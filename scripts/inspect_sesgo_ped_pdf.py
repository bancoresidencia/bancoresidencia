import pypdf

reader_gb = pypdf.PdfReader('data/official_exams/SES_GO_2026/GB_PEDIATRIA_A.pdf')
print('=== SES_GO 2026 GB PEDIATRIA A ===')
for page in reader_gb.pages:
    print(page.extract_text()[:600])

reader_pv = pypdf.PdfReader('data/official_exams/SES_GO_2026/PV_PEDIATRIA_A.pdf')
print('\n=== SES_GO 2026 PV PEDIATRIA A ===')
for i in range(min(5, len(reader_pv.pages))):
    print(f'--- Page {i+1} ---')
    print(reader_pv.pages[i].extract_text()[:600])
