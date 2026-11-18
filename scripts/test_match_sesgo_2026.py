import json
import pypdf
import os
import re

with open('data/pending_sesgo_all.json', 'r', encoding='utf-8') as f:
    pendings = json.load(f)

p2026 = [q for q in pendings if q['year'] == 2026]
print(f"Total pendências SES-GO 2026: {len(p2026)}")

# Load Acesso Direto Versao A
folder = 'data/incoming_exams/SES_GO_2026'
pv_path = os.path.join(folder, 'PV_SESGO_2026_VERSAO_A_Areas_Basicas_e_Especialidades_de_Acesso_Direto__R1_.pdf')
gb_path = os.path.join(folder, 'GB_SESGO_2026_VERSAO_A_Areas_Basicas_e_Especialidades_de_Acesso_Direto__R1_.pdf')

reader = pypdf.PdfReader(pv_path)
full_text = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()]).lower()

hits = []
misses = []

for q in p2026:
    stmt = q['statement'].lower()
    # clean words
    words = re.findall(r'\b\w+\b', stmt)
    # search a 6-word phrase
    found = False
    for i in range(len(words) - 5):
        phrase = ' '.join(words[i:i+6])
        if phrase in full_text:
            found = True
            break
    if found:
        hits.append(q)
    else:
        misses.append(q)

print(f"Matched in Acesso Direto Versao A: {len(hits)} / {len(p2026)}")
print(f"Not in Acesso Direto Versao A: {len(misses)}")

if misses:
    print("\nFirst 5 not matched in Acesso Direto:")
    for m in misses[:5]:
        print(f"  [{m['code']}] {m['especialidade']} - {m['statement'][:80]}")
