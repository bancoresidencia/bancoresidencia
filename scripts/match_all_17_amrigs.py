import glob
import pypdf
import re

missing_qs = [
    # AMRIGS 2023
    ('2023', '73420d27-798e-4865-9ea7-51ea0e4bfa74', 'anatomia hepática e biliar'),
    ('2023', 'ddde8e6a-a471-4750-acc0-4e115d077e93', 'anatomia da via biliar'),
    ('2023', '64329efb-2a4a-4863-ad4b-84ada7f05bb0', 'mais comum de polidrâmnio'),
    ('2023', 'e6d90625-310b-43ff-9e69-c8341cf9a7ee', 'logotipo da Cochrane'),
    ('2023', 'dcff767e-e20f-43a7-aa27-ada87eb70c52', 'orientações de puericultura'),
    ('2023', 'd9344edf-4fc7-4e49-99ba-228871c7c341', 'perímetro cefálico aumenta no primeiro trimestre'),
    # AMRIGS 2024
    ('2024', '15099e5f-ebab-413a-941f-698a5fdfa7ea', 'rejeição de tela inabsorvível'),
    ('2024', '1d28ebba-05d4-4cd7-b8de-7c9b32bdb0ec', 'ventilação mecânica pós-operatória'),
    ('2024', 'b31dad9b-b56f-48fd-be50-26fd989e8642', 'TNM de classificação dos tumores malignos encontrados no intestino delgado'),
    ('2024', 'bc17da94-d351-41fc-8e34-c8fe5f437b44', 'mordedura por animal'),
    ('2024', '47beb8a7-920b-4b8f-a309-084d8c2f3295', 'sepse por Epstein-Barr'),
    # AMRIGS 2025
    ('2025', '0582117b-7f2f-4e40-bb70-db84d869567d', 'seta indica o(s)'),
    ('2025', '6a4b92db-9a3a-45c3-add0-ff0373afb413', 'padrão-ouro'),
    ('2025', '7f2724ea-b8fe-414e-b5d2-2970ca2ff2df', 'Em um forest plot, um estudo individual'),
    ('2025', '2ff2f6ff-c03c-4c7b-a5b6-0c92f1d98e41', 'transporte de substâncias por meio da placenta'),
    ('2025', 'baa8a4b7-8f36-4bf4-b82a-e0ccef2b39ca', 'tetralogia de Fallot'),
    ('2025', 'aae83d52-43eb-49a1-9527-639dc984b1ad', 'RN prematuro é uma extensão')
]

pdf_texts = {}
for y in ['2021', '2022', '2023', '2024', '2025']:
    for pf in glob.glob(f'data/official_exams/AMRIGS/*{y}*PROVA*.pdf'):
        try:
            reader = pypdf.PdfReader(pf)
            txt = ''
            for p in reader.pages:
                txt += p.extract_text() + '\n'
            pdf_texts[pf] = re.sub(r'\s+', ' ', txt)
            print(f"Loaded {pf}: {len(pdf_texts[pf])} chars")
        except Exception as e:
            print(f"Error {pf}: {e}")

print("\n=== MATCHING 17 MISSING QUESTIONS ===")
for yr, qid, search_term in missing_qs:
    words = search_term.lower().split()
    found_any = False
    for pf, txt in pdf_texts.items():
        # search
        t_low = txt.lower()
        if all(w in t_low for w in words[:3]):
            pos = t_low.find(words[0])
            # find question
            qm = list(re.finditer(r'QUEST[ÃA]O\s+(\d+)', txt[:pos+len(search_term)+100], re.I))
            if qm:
                qnum = qm[-1].group(0)
                snippet = txt[qm[-1].start():pos+100][:140]
                print(f"MATCH: [{yr}] {qid} -> {qnum} in {pf}")
                print(f"   Snippet: {snippet}")
                found_any = True
                break
    if not found_any:
        print(f"NOT FOUND: [{yr}] {qid} ({search_term})")
