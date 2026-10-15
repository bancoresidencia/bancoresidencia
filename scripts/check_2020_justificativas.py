from pypdf import PdfReader
import sys, re
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

r = PdfReader('data/official_exams/AMRIGS/AMRIGS_2020_concurso_594.pdf')
print("Total pages:", len(r.pages))

full_justificativas = ""
for i in range(1, len(r.pages)):
    full_justificativas += f"\n--- PAGE {i+1} ---\n" + r.pages[i].extract_text()

# Find all occurrences of QUESTÃO
q_matches = re.findall(r'(QUEST[AÃ]O\s+\d+[^–\n]*[–-][^\n]+)', full_justificativas, re.I)
print(f"Total QUESTÃO mentions found: {len(q_matches)}")
for qm in q_matches[:30]:
    print(" ", qm.strip())
