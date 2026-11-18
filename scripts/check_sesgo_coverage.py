import os
import pypdf
import json
import re

folder = 'data/incoming_exams/SES_GO_2026'
pdf_files = sorted([f for f in os.listdir(folder) if f.startswith('PV_') and f.endswith('.pdf')])

with open('data/pending_sesgo_all.json', 'r', encoding='utf-8') as f:
    pendings = json.load(f)

p2026 = [q for q in pendings if q['year'] == 2026]
print(f"Total pendências 2026: {len(p2026)}")

# Cache all PV texts
pv_texts = {}
for pv in pdf_files:
    reader = pypdf.PdfReader(os.path.join(folder, pv))
    pv_texts[pv] = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()]).lower()

matched_qs = {}
unmatched_qs = []

for q in p2026:
    stmt = q['statement'].lower()
    words = re.findall(r'\b\w+\b', stmt)
    
    found_pv = None
    if len(words) >= 4:
        # try 4 to 6 word phrases
        for n in [6, 5, 4]:
            for i in range(len(words) - n + 1):
                phrase = ' '.join(words[i:i+n])
                for pv, txt in pv_texts.items():
                    if phrase in txt:
                        found_pv = (pv, phrase)
                        break
                if found_pv:
                    break
            if found_pv:
                break
                
    if found_pv:
        matched_qs[q['code']] = found_pv
    else:
        unmatched_qs.append(q)

print(f"\n================ RESUMO COBERTURA SES-GO 2026 ================")
print(f"Total pendências analisadas: {len(p2026)}")
print(f"Casadas nos PDFs de 2026: {len(matched_qs)} ({len(matched_qs)/len(p2026)*100:.1f}%)")
print(f"Não casadas: {len(unmatched_qs)}")

if unmatched_qs:
    print(f"\nExemplos de não casadas ({len(unmatched_qs)}):")
    for u in unmatched_qs[:8]:
        print(f"  [{u['code']}] {u['especialidade']} - {u['statement'][:80]}")
