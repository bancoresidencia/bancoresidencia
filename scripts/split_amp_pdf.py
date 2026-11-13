import pypdf
import os

pdf_path = 'data/official_exams/AMP_PARANA/AMP_2024_PROVA_GERAL.pdf'
out_dir = 'data/temp_amp_parts'
os.makedirs(out_dir, exist_ok=True)

reader = pypdf.PdfReader(pdf_path)
total = len(reader.pages)

chunks = [
    (0, 7, 'part1_p01_07.pdf'),
    (7, 13, 'part2_p08_13.pdf'),
    (13, 20, 'part3_p14_20.pdf'),
    (20, total, 'part4_p21_26.pdf')
]

for start, end, fname in chunks:
    writer = pypdf.PdfWriter()
    for i in range(start, end):
        writer.add_page(reader.pages[i])
    fpath = os.path.join(out_dir, fname)
    with open(fpath, 'wb') as f:
        writer.write(f)
    print(f"{fname}: pages {start+1}-{end}, size={os.path.getsize(fpath)/(1024*1024):.1f} MB")
