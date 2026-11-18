import pypdf
import re

reader_gb = pypdf.PdfReader('data/official_exams/UERJ/UERJ_2024_GABARITO_DEFINITIVO.pdf')
txt_gb = '\n'.join([p.extract_text() for p in reader_gb.pages if p.extract_text()])

# Extract R1..R100 and their answers
r_nums = re.findall(r'\bR(\d{1,3})\b', txt_gb)
letters = re.findall(r'\b([A-DX])\b', txt_gb)
# Filter letters that come after R100
pos_r100 = txt_gb.find('R100')
ans_txt = txt_gb[pos_r100 + 4:]
ans_letters = re.findall(r'\b([A-DX])\b', ans_txt)

print(f"UERJ R-nums: {len(r_nums)}, Letters: {len(ans_letters)}")
answers = {}
for n, l in zip(r_nums, ans_letters):
    answers[int(n)] = 'ANULADA' if l == 'X' else l

print("Sample UERJ 2024 answers 1..10:", [answers.get(i) for i in range(1, 11)])

# Extract questions from PV
reader_pv = pypdf.PdfReader('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf')
txt_pv = '\n'.join([p.extract_text() for p in reader_pv.pages if p.extract_text()])

chunks = re.split(r'\n\s*(\d{1,3})\)\s+', txt_pv)
print(f"Chunks from UERJ 2024 PV: {len(chunks)}")
qs = {}
for i in range(1, len(chunks), 2):
    num = int(chunks[i])
    raw = chunks[i+1].strip()
    alt_matches = list(re.finditer(r'(?:^|\n)\s*\(([A-D])\)\s*([\s\S]*?)(?=(?:^|\n)\s*\([A-D]\)|$)', raw))
    if len(alt_matches) >= 3:
        stmt = raw[:alt_matches[0].start()].strip()
        opts = [{'letter': m.group(1).upper(), 'text': m.group(2).strip()} for m in alt_matches]
        qs[num] = {'statement': stmt, 'options': opts}

print(f"Successfully extracted {len(qs)} questions from UERJ 2024 PV!")
print("Sample Q1:", qs[1]['statement'][:100], "Options:", len(qs[1]['options']))
