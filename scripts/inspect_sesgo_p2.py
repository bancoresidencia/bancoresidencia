import pypdf

reader = pypdf.PdfReader('data/official_exams/SES_GO_2024/PV_ACESSO_DIRETO_2024.pdf')
for i in [1, 2, 3]:
    print(f"\n--- PAGE {i} ---")
    print(reader.pages[i].extract_text()[:600])
