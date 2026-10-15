from pypdf import PdfReader
import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

r = PdfReader('data/official_exams/AMRIGS/AMRIGS_2021_concurso_604.pdf')
print("Pages in 604:", len(r.pages))
for i in range(len(r.pages)):
    print(f"--- Page {i+1} ---")
    print(r.pages[i].extract_text()[:600])
