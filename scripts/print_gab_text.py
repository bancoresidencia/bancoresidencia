import pypdf

for fn in ['GAB_DEFINITIVO_138RMUNIF_001_01.PDF', 'GAB_DEFINITIVO_138RMUNIF_002_02.PDF']:
    path = f'data/incoming_exams/SES_DF_2016/{fn}'
    reader = pypdf.PdfReader(path)
    txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    print(f"==================== {fn} ====================")
    for i, line in enumerate(txt.split('\n')):
        print(f"{i:2d}: {repr(line)}")
