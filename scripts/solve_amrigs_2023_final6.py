import pypdf
import re
import json

reader_pv = pypdf.PdfReader('data/official_exams/AMRIGS/AMRIGS_2023_PROVA.pdf')
full_text = ""
for page in reader_pv.pages:
    full_text += "\n" + page.extract_text()

reader_gb = pypdf.PdfReader('data/official_exams/AMRIGS/AMRIGS_2023_GABARITO.pdf')
gb_text = reader_gb.pages[0].extract_text()

# Parse gabarito
gabarito = {}
for line in gb_text.split('\n'):
    m = re.search(r'([0-9]{1,3})\s+([A-E\*])', line)
    if m:
        gabarito[int(m.group(1))] = m.group(2)

print(f"Loaded {len(gabarito)} answers from AMRIGS 2023 gabarito")

targets = [
    ("hepática e biliar", "73420d27-798e-4865-9ea7-51ea0e4bfa74"),
    ("via biliar", "ddde8e6a-a471-4750-acc0-4e115d077e93"),
    ("polidrâmnio", "64329efb-2a4a-4863-ad4b-84ada7f05bb0"),
    ("Cochrane", "e6d90625-310b-43ff-9e69-c8341cf9a7ee"),
    ("puericultura", "dcff767e-e20f-43a7-aa27-ada87eb70c52"),
    ("perímetro cefálico", "d9344edf-4fc7-4e49-99ba-228871c7c341")
]

for term, qid in targets:
    pos = full_text.lower().find(term.lower())
    if pos != -1:
        # find nearest question number before pos
        snippet = full_text[max(0, pos-250):pos+50]
        # look for QUESTÃO XX
        m = re.findall(r'QUEST[ÃA]O\s+([0-9]{1,3})', snippet, re.IGNORECASE)
        if m:
            qnum = int(m[-1])
            ans = gabarito.get(qnum)
            print(f"Matched {qid} ({term}) -> QUESTÃO {qnum} = {ans}")
        else:
            print(f"Number not found for {term}, snippet: {repr(snippet)}")
    else:
        print(f"Term '{term}' not found in AMRIGS 2023 prova")
