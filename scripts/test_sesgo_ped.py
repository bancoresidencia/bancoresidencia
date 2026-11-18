import pypdf
import os

pdf_path = "data/official_exams/SES_GO_2026/SES_GO_2026_PV_PEDIATRIA_A.pdf"
gb_path = "data/official_exams/SES_GO_2026/SES_GO_2026_GB_PEDIATRIA_A.pdf"

print("Checking PV:", os.path.exists(pdf_path))
print("Checking GB:", os.path.exists(gb_path))

reader_gb = pypdf.PdfReader(gb_path)
print(f"GB pages: {len(reader_gb.pages)}")
for p in reader_gb.pages:
    print("GB text:")
    print(p.extract_text()[:400])

reader_pv = pypdf.PdfReader(pdf_path)
print(f"PV pages: {len(reader_pv.pages)}")
print("PV Page 1 text:")
print(reader_pv.pages[0].extract_text()[:400])

