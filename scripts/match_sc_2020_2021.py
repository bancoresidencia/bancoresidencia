import json, sys, pypdf, re

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# 1. Inspect the 3 questions in database:
with open('data/clinica_medica_final_questions.json', 'r', encoding='utf-8') as f:
    cm = json.load(f)
with open('data/cirurgia_final_questions.json', 'r', encoding='utf-8') as f:
    cir = json.load(f)

q_2020_1 = [q for q in cm if q.get('id') == '15e5a670-0929-4c1e-ba3e-1b86e611b638'][0]
q_2020_2 = [q for q in cm if q.get('id') == 'f8085777-332f-42ea-9a28-b344ec0997d3'][0]
q_2021_1 = [q for q in cir if q.get('id') == 'c88db56a-eefe-45f7-85d5-dc6d8a456337'][0]

print("=== Q_2020_1 ===")
print("Stmt:", q_2020_1.get('statement')[:150])
for opt in q_2020_1.get('options', []):
    print(f"  {opt.get('letter')}: {opt.get('text')}")

print("\n=== Q_2020_2 ===")
print("Stmt:", q_2020_2.get('statement')[:150])
for opt in q_2020_2.get('options', []):
    print(f"  {opt.get('letter')}: {opt.get('text')}")

print("\n=== Q_2021_1 ===")
print("Stmt:", q_2021_1.get('statement')[:150])
for opt in q_2021_1.get('options', []):
    print(f"  {opt.get('letter')}: {opt.get('text')}")

# Now check in the 2020 booklet:
reader_2020 = pypdf.PdfReader('data/official_exams/SANTA_CASA_SP/SANTA_CASA_2020_PROVAS/100_ISCMSP_RM_2020_Programa_Acesso_Direto_QUADRIX_Cad. Prova.pdf')
full_2020 = '\n'.join([p.extract_text() or '' for p in reader_2020.pages])

# Find question number for derrame pleural and carcinoma gastrico
m1 = re.search(r'QUEST[ÃA]O\s+(\d+).*?derrames pleurais', full_2020, re.IGNORECASE | re.DOTALL)
if m1:
    print(f"\n2020 Derrame pleural found at Questão {m1.group(1)}")
else:
    # search without regex
    idx = full_2020.lower().find('derrames pleurais')
    if idx != -1:
        print("2020 Derrame pleural context:", full_2020[max(0, idx-100):idx+100])

idx2 = full_2020.lower().find('carcinoma')
if idx2 != -1:
    print("2020 Carcinoma gástrico context:", full_2020[max(0, idx2-100):idx2+100])

# Check in 2021 booklet:
reader_2021 = pypdf.PdfReader('data/official_exams/SANTA_CASA_SP/SANTA_CASA_2021_PROVAS/QUADRIX_Cad_Prova_001_Programa_Acesso_Direto_ISCMSP_RM-2021.pdf')
full_2021 = '\n'.join([p.extract_text() or '' for p in reader_2021.pages])
idx3 = full_2021.lower().find('inguinocrural')
if idx3 != -1:
    print("2021 Inguinocrural context:", full_2021[max(0, idx3-100):idx3+100])
