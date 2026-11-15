import pypdf

# 1. Inspect FUBOG Gabarito
reader_gb = pypdf.PdfReader('data/official_exams/FUBOG/GB_FUBOG_V1A.pdf')
print('=== FUBOG GB V1A (Pages:', len(reader_gb.pages), ') ===')
for i, page in enumerate(reader_gb.pages):
    print(f'--- Page {i+1} ---')
    print(page.extract_text()[:600])

# 2. Inspect FUBOG Prova
reader_pv = pypdf.PdfReader('data/official_exams/FUBOG/PV_FUBOG_V1A.pdf')
print('\n=== FUBOG PV V1A (Pages:', len(reader_pv.pages), ') ===')
print('--- Page 1 ---')
print(reader_pv.pages[0].extract_text()[:600])
print('--- Page 2 ---')
print(reader_pv.pages[1].extract_text()[:600])
