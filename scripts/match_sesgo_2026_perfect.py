import os
import pypdf
import json
import re

folder = 'data/incoming_exams/SES_GO_2026'

with open('data/pending_sesgo_all.json', 'r', encoding='utf-8') as f:
    pendings = json.load(f)

p2026 = [q for q in pendings if q['year'] == 2026]

# Parse gabaritos for Versao A
# Instituto Verbena / UFG answer keys are formatted as:
# QUESTÃO RESPOSTA
# 1 A
# 2 C
# ...
def parse_verbena_gabarito(gb_path):
    reader = pypdf.PdfReader(gb_path)
    txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    
    # Extract pairs: "1 A" or "01 A" or "1\nA" or "QUESTÃO 1 ... A"
    # Let's inspect text lines
    answers = {}
    lines = [l.strip() for l in txt.split('\n') if l.strip()]
    for l in lines:
        m = re.match(r'^(\d{1,3})\s+([A-D]|X|\*|ANULADA)$', l, re.IGNORECASE)
        if m:
            answers[int(m.group(1))] = m.group(2).upper()
            
    # If not matched by line, try regex across text
    if len(answers) < 10:
        matches = re.findall(r'(?:^|\n)\s*(\d{1,3})\s*[-–.]?\s*([A-D]|X|\*)\b', txt, re.IGNORECASE)
        for num, ans in matches:
            answers[int(num)] = ans.upper()
            
    return answers

# Load exams and gabaritos
exam_pairs = []
for f in sorted(os.listdir(folder)):
    if f.startswith('PV_') and f.endswith('.pdf'):
        pv_file = f
        gb_file = f.replace('PV_', 'GB_')
        gb_path = os.path.join(folder, gb_file)
        if os.path.exists(gb_path):
            exam_pairs.append((pv_file, gb_file))

print(f"Total PV-GB pairs in SES_GO_2026: {len(exam_pairs)}")

# Test parsing on first pair
first_pv, first_gb = exam_pairs[0]
ganswers = parse_verbena_gabarito(os.path.join(folder, first_gb))
print(f"Sample gabarito {first_gb}: {len(ganswers)} keys parsed")
print("First 10:", {k: ganswers[k] for k in sorted(ganswers.keys())[:10]})
