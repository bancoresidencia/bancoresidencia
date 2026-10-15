import pypdf
import re
import json

# --- 2024 ---
print("=== USP 2024 ===")
reader_gb24 = pypdf.PdfReader('data/official_exams/USP_FUVEST/USP_FUVEST_2024_GB.pdf')
# Find Prova A gabarito
p1_24 = reader_gb24.pages[0].extract_text()
print("GB 2024 Page 1 sample:", p1_24[:200])

reader_pv24 = pypdf.PdfReader('data/official_exams/USP_FUVEST/USP_FUVEST_2024_PV.pdf')
text_24 = ""
for page in reader_pv24.pages:
    text_24 += "\n" + page.extract_text()

q24_1 = "diabetes melito e insufici"
q24_2 = "lesões na face"
q24_3 = "corrimento vaginal"

for name, qstr in [("Q1", q24_1), ("Q2", q24_2), ("Q3", q24_3)]:
    m = re.search(r'([0-9]{1,3})[^\n]*\n[^\n]*' + qstr, text_24, re.IGNORECASE)
    if not m:
        # try finding question number right above
        pos = text_24.lower().find(qstr.lower())
        if pos != -1:
            snippet = text_24[max(0, pos-200):pos+100]
            print(f"2024 {name} snippet:", repr(snippet))
        else:
            print(f"2024 {name} not found directly")
    else:
        print(f"2024 {name} found near:", repr(m.group(0)[:80]))

# --- 2025 ---
print("\n=== USP 2025 ===")
reader_gb25 = pypdf.PdfReader('data/official_exams/USP_FUVEST/USP_FUVEST_2025_GB.pdf')
print("GB 2025 Page 1 sample:", reader_gb25.pages[0].extract_text()[:200])

reader_pv25 = pypdf.PdfReader('data/official_exams/USP_FUVEST/USP_FUVEST_2025_PV.pdf')
text_25 = ""
for page in reader_pv25.pages:
    text_25 += "\n" + page.extract_text()

pos25 = text_25.lower().find("esquizofrenia")
if pos25 != -1:
    print("2025 esquizofrenia snippet:", repr(text_25[max(0, pos25-200):pos25+100]))
else:
    print("2025 esquizofrenia not found directly")
