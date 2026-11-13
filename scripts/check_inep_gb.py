from pypdf import PdfReader

pdf_path = "data/official_exams/INEP_REVALIDA/INEP_2025_2_GB.pdf"
reader = PdfReader(pdf_path)
print(f"INEP 2025.2 GB total pages: {len(reader.pages)}")
for i, p in enumerate(reader.pages):
    print(f"Page {i+1}: text len = {len(p.extract_text() or '')}, images = {len(p.images)}")

