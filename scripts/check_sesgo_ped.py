import pypdf
import re

reader = pypdf.PdfReader('data/official_exams/SES_GO_2026/SES_GO_2026_PV_PEDIATRIA_A.pdf')
txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
print(f"Text length: {len(txt)}")

terms = ['coqueluche', 'dengue', 'febre reumática', 'hpv', 'vacina']
for t in terms:
    m = [m.start() for m in re.finditer(t, txt, re.IGNORECASE)]
    print(f"Term '{t}': found {len(m)} times in SES_GO_2026_PV_PEDIATRIA_A.pdf")
    if m:
        pos = m[0]
        print(f"  Snippet around '{t}':", txt[max(0, pos-50):pos+150].replace('\n', ' '))
