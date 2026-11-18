import os
import sys
import glob
sys.path.append('.')
from scripts.run_fase1_pdf_universal import parse_gabarito, parse_prova

gb_files = glob.glob('data/incoming_exams/Selecting_*/*GB*.pdf')
print(f"Total Gabarito files found in Selecting: {len(gb_files)}", flush=True)

for gb in sorted(gb_files):
    answers = parse_gabarito(gb)
    print(f"{os.path.basename(gb)}: {len(answers)} respostas extraídas. Sample (1..5): {dict(list(answers.items())[:5])}", flush=True)
