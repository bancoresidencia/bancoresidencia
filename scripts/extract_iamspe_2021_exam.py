import pypdf, re, json, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

pdf_path = 'data/official_exams/IAMSPE/QUADRIX_001_IAMSPE-RM-2021_Prova_Objetiva_ACESSO DIRETO-AREAS BASICAS.pdf'
reader = pypdf.PdfReader(pdf_path)

full_text = ""
for page in reader.pages:
    full_text += page.extract_text() + "\n"

print(f"Total extracted chars: {len(full_text):,}")

# Official answers 1..80:
# Row 1 (1-20): C D X C A X B D D A B A D X C D E B C C
# Row 2 (21-40): E A E C A D E B C B B E C B B C C D E C
# Row 3 (41-60): A A X E B B D A B D C E B A D A A E A A
# Row 4 (61-80): E B E X A A D B C D E A C D E E B B D C

row1 = "C D X C A X B D D A B A D X C D E B C C".split()
row2 = "E A E C A D E B C B B E C B B C C D E C".split()
row3 = "A A X E B B D A B D C E B A D A A E A A".split()
row4 = "E B E X A A D B C D E A C D E E B B D C".split()

official_keys = row1 + row2 + row3 + row4

# Let's split by "QUESTÃO X"
# Standard pattern: QUESTÃO 1, QUESTÃO 2, ...
q_blocks = {}
parts = re.split(r'\bQUEST[ÃA]O\s+(\d+)\b', full_text, flags=re.I)
print(f"Parts found: {len(parts)}")

for i in range(1, len(parts), 2):
    q_num = int(parts[i])
    q_text = parts[i+1].strip()
    q_blocks[q_num] = q_text

print(f"Questões identificadas no PDF: {len(q_blocks)}")
for q_num in sorted(q_blocks.keys())[:10]:
    txt = q_blocks[q_num].replace('\n', ' ')[:80]
    print(f"  Q{q_num:>2} ({official_keys[q_num-1]}): {txt}...")
