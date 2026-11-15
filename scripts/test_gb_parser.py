import pypdf
import re

def parse_gabarito_text(txt):
    answers = {}
    # Pattern 1: Table format like SES_GO (lines of numbers then lines of letters)
    # E.g.:
    # 01 02 03 04 05
    # C B B D C
    lines = [l.strip() for l in txt.split('\n') if l.strip()]
    for i in range(len(lines) - 1):
        num_match = re.findall(r'\b\d{1,3}\b', lines[i])
        letter_match = re.findall(r'\b[A-EX\*X]\b', lines[i+1], re.IGNORECASE)
        if len(num_match) >= 3 and len(num_match) == len(letter_match):
            for n, l in zip(num_match, letter_match):
                answers[int(n)] = 'ANULADA' if l.upper() in ['X', '*'] else l.upper()

    # Pattern 2: Vertical pairs like FUBOG:
    # 01
    # B
    # 02
    # A
    for i in range(len(lines) - 1):
        if re.match(r'^\d{1,3}$', lines[i]) and re.match(r'^[A-EX\*]$', lines[i+1], re.IGNORECASE):
            n = int(lines[i])
            l = lines[i+1].upper()
            answers[n] = 'ANULADA' if l in ['X', '*'] else l

    # Pattern 3: Inline like "01. A" or "1 - B"
    inline_matches = re.findall(r'\b(\d{1,3})[\.\-\s\:]+([A-EX\*])\b', txt, re.IGNORECASE)
    for n, l in inline_matches:
        answers[int(n)] = 'ANULADA' if l.upper() in ['X', '*'] else l.upper()

    return answers

# Test on SES_GO
reader = pypdf.PdfReader('data/official_exams/SES_GO_2026/GB_ACESSO_DIRETO_A.pdf')
txt = '\n'.join([p.extract_text() for p in reader.pages])
ans = parse_gabarito_text(txt)
print(f"SES_GO 2026 Acesso Direto Answers ({len(ans)}):", {k: ans[k] for k in sorted(ans.keys())[:15]})

# Test on FUBOG
reader2 = pypdf.PdfReader('data/official_exams/FUBOG/GB_FUBOG_V1A.pdf')
txt2 = '\n'.join([p.extract_text() for p in reader2.pages])
ans2 = parse_gabarito_text(txt2)
print(f"FUBOG V1A Answers ({len(ans2)}):", {k: ans2[k] for k in sorted(ans2.keys())[:15]})
