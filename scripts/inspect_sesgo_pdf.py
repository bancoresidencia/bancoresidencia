import pypdf

# 1. Inspect SES_GO 2026 Gabarito
reader_gb = pypdf.PdfReader('data/official_exams/SES_GO_2026/GB_ACESSO_DIRETO_A.pdf')
print('=== SES_GO 2026 GB ACESSO DIRETO (Pages:', len(reader_gb.pages), ') ===')
for i, page in enumerate(reader_gb.pages):
    print(f'--- Page {i+1} ---')
    print(page.extract_text()[:600])

# 2. Inspect SES_GO 2026 Prova
reader_pv = pypdf.PdfReader('data/official_exams/SES_GO_2026/PV_ACESSO_DIRETO_A.pdf')
print('\n=== SES_GO 2026 PV ACESSO DIRETO (Pages:', len(reader_pv.pages), ') ===')
print('--- Page 1 ---')
print(reader_pv.pages[0].extract_text()[:600])
print('--- Page 2 ---')
print(reader_pv.pages[1].extract_text()[:600])
