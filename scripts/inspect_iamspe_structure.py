import pypdf, re, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

pdf_path = 'data/official_exams/IAMSPE/QUADRIX_001_IAMSPE-RM-2021_Prova_Objetiva_ACESSO DIRETO-AREAS BASICAS.pdf'
reader = pypdf.PdfReader(pdf_path)
full_text = ""
for page in reader.pages:
    full_text += page.extract_text() + "\n"

parts = re.split(r'\bQUEST[ÃA]O\s+(\d+)\b', full_text, flags=re.I)
for i in range(1, len(parts), 2):
    q_num = int(parts[i])
    q_text = parts[i+1].strip().replace('\n', ' ')
    # print every 5th question or transition
    if q_num in [1, 16, 17, 32, 33, 48, 49, 64, 65, 80]:
        print(f"Q{q_num:>2}: {q_text[:90]}...")
