from pypdf import PdfReader
import re

def parse_amrigs_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

print("--- AMRIGS 2020 (594) ---")
t2020 = parse_amrigs_pdf("data/official_exams/AMRIGS/AMRIGS_2020_concurso_594.pdf")
print(t2020[:1500])

print("\n--- AMRIGS 2021 (647) ---")
t2021 = parse_amrigs_pdf("data/official_exams/AMRIGS/AMRIGS_2021_concurso_647.pdf")
print(t2021[:1500])
