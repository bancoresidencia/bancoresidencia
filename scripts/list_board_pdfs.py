import os
import glob

pdf_files = glob.glob('data/official_exams/**/*.pdf', recursive=True)
print(f"Total PDFs encontrados: {len(pdf_files)}")

boards = ['SURCE', 'MARIO_GATTI', 'SES_GO', 'AMP_PARANA', 'ENARE', 'INEP_REVALIDA', 'ABEM', 'PSU_MG']

for b in boards:
    matched = [f for f in pdf_files if b.lower() in f.lower()]
    print(f"\n=== {b} ({len(matched)} PDFs) ===")
    for m in matched[:15]:
        print("  ", m)
