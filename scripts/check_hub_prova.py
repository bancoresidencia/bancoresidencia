import pypdf

pv = 'data/incoming_exams/HUB_2016/PV_HUB_2016_ACESSO_DIRETO.pdf'
reader = pypdf.PdfReader(pv)
print(f"Total pages: {len(reader.pages)}")
for p_idx in [1, 2]:
    print(f"\n--- PAGE {p_idx} ---")
    print(reader.pages[p_idx].extract_text()[:1500])
