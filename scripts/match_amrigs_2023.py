import pypdf, re, json

# 1. Match AMRIGS 2023 missing (6)
reader_2023_p = pypdf.PdfReader('data/official_exams/AMRIGS/AMRIGS_2023_PROVA.pdf')
text_2023_p = ''
for p in reader_2023_p.pages:
    text_2023_p += p.extract_text() + '\n'
norm_2023_p = re.sub(r'\s+', ' ', text_2023_p)

reader_2023_g = pypdf.PdfReader('data/official_exams/AMRIGS/AMRIGS_2023_GABARITO.pdf')
text_2023_g = ''
for p in reader_2023_g.pages:
    text_2023_g += p.extract_text() + '\n'

print("=== AMRIGS 2023 GABARITO SNIPPET ===")
print(text_2023_g[:600])

targets_2023 = [
    ('73420d27-798e-4865-9ea7-51ea0e4bfa74', 'anatomia hepática e biliar'),
    ('ddde8e6a-a471-4750-acc0-4e115d077e93', 'anatomia da via biliar'),
    ('64329efb-2a4a-4863-ad4b-84ada7f05bb0', 'mais comum de polidrâmnio'),
    ('e6d90625-310b-43ff-9e69-c8341cf9a7ee', 'logotipo da Cochrane'),
    ('dcff767e-e20f-43a7-aa27-ada87eb70c52', 'orientações de puericultura'),
    ('d9344edf-4fc7-4e49-99ba-228871c7c341', 'perímetro cefálico aumenta no primeiro trimestre')
]

for qid, term in targets_2023:
    pos = norm_2023_p.lower().find(term.lower())
    if pos != -1:
        qm = list(re.finditer(r'QUEST[ÃA]O\s+(\d+)', norm_2023_p[:pos], re.I))
        if qm:
            print(f"2023 {term} -> {qm[-1].group(0)}: {norm_2023_p[qm[-1].start():pos+80][:100]}")
    else:
        # try keywords
        kw = term.split()[0]
        print(f"2023 {term} not found directly, searching '{kw}'...")
        for m in re.finditer(r'QUEST[ÃA]O\s+(\d+)\b(.*?)(?=QUEST[ÃA]O|\Z)', norm_2023_p, re.I):
            if any(k in m.group(2).lower() for k in term.lower().split()[:2]):
                print(f"  candidate Q{m.group(1)}: {m.group(2)[:100]}")
