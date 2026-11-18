import pypdf
import re

gb = 'data/incoming_exams/HUB_2016/GB_HUB_2016_ACESSO_DIRETO.pdf'
reader = pypdf.PdfReader(gb)
txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
print("Gabarito text preview:")
print(txt[:1000])

# Procura itens e gabaritos
matches = re.findall(r'(\d{1,3})\s+([CE\*X])', txt)
print(f"\nTotal matches found: {len(matches)}")
print("Sample matches (1..20):", matches[:20])
