import pypdf
import re
import json

reader_pv = pypdf.PdfReader('data/official_exams/AMRIGS/AMRIGS_2025_PROVA.pdf')
full_text = ""
for page in reader_pv.pages:
    full_text += "\n" + page.extract_text()

reader_gb = pypdf.PdfReader('data/official_exams/AMRIGS/AMRIGS_2025_GABARITO.pdf')
gb_full = ""
for page in reader_gb.pages:
    gb_full += "\n" + page.extract_text()

# Find where ACESSO DIRETO gabarito is in gb_full
pos_ad = gb_full.find("ACESSO DIRETO")
print("ACESSO DIRETO found in GB:", pos_ad != -1)
gb_snippet = gb_full[pos_ad:pos_ad+1500] if pos_ad != -1 else gb_full[:1500]

gabarito = {}
# Find pairs like 1 A 2 B or 1 2 3 ... A B C ...
# Let's search pattern QUESTÃO: XX - MANTIDA alternativa 'X' or similar
for m in re.finditer(r'([0-9]{1,3})\s+([A-E\*])', gb_snippet):
    gabarito[int(m.group(1))] = m.group(2)

print(f"Parsed {len(gabarito)} answers from gabarito snippet")
if len(gabarito) < 20:
    print("GB sample:", repr(gb_snippet[:500]))

targets = [
    ("Figura 1 abaixo, a seta", "0582117b-7f2f-4e40-bb70-db84d869567d"),
    ("teste padrão-ouro", "6a4b92db-9a3a-45c3-add0-ff0373afb413"),
    ("forest plot", "7f2724ea-b8fe-414e-b5d2-2970ca2ff2df"),
    ("transporte de substâncias por meio da placenta", "2ff2f6ff-c03c-4c7b-a5b6-0c92f1d98e41"),
    ("tetralogia de Fallot", "baa8a4b7-8f36-4bf4-b82a-e0ccef2b39ca"),
    ("seguimento ambulatorial do RN prematuro", "aae83d52-43eb-49a1-9527-639dc984b1ad")
]

for term, qid in targets:
    pos = full_text.lower().find(term.lower())
    if pos != -1:
        snippet = full_text[max(0, pos-250):pos+50]
        m = re.findall(r'QUEST[ÃA]O\s+([0-9]{1,3})', snippet, re.IGNORECASE)
        if m:
            qnum = int(m[-1])
            print(f"Matched {qid} ({term}) -> QUESTÃO {qnum}")
        else:
            print(f"Number not found for {term}, snippet: {repr(snippet)}")
    else:
        print(f"Term '{term}' not found in AMRIGS 2025 prova")
