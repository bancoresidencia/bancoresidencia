import json
import pypdf
import os
import re

folder = 'data/incoming_exams/SES_DF_2016'

# 1. Carregar pendentes
with open('data/pending_hub_2016.json', 'r', encoding='utf-8') as f:
    pendings = json.load(f)

print(f"Total pendentes: {len(pendings)}")

# 2. Carregar todos os PDFs de exames
exam_files = sorted([f for f in os.listdir(folder) if f.startswith('138RMUNIF_') and f.endswith('.pdf')])
print(f"Arquivos de prova encontrados ({len(exam_files)}): {exam_files}")

exams_data = {}
for ef in exam_files:
    path = os.path.join(folder, ef)
    reader = pypdf.PdfReader(path)
    full_text = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    
    # Extrair gabarito correspondente
    # Padrão: GAB_DEFINITIVO_138RMUNIF_001_01.PDF
    base_name = ef[:-4]
    gab_fn = f"GAB_DEFINITIVO_{base_name}.PDF"
    gab_path = os.path.join(folder, gab_fn)
    gab_map = {}
    if os.path.exists(gab_path):
        greader = pypdf.PdfReader(gab_path)
        gtxt = '\n'.join([p.extract_text() for p in greader.pages if p.extract_text()])
        
        # Parse Cebraspe gabarito format
        # Usually it has rows of question numbers and rows of answers
        # Let's inspect gtxt:
        # e.g.:
        # 1 23456789 1 0 1 1 1 2 1 3 1 4 1 5 1 6 1 7 1 8 1 9 2 0
        # C EEEECEECEECEC C EC E EC
        # Let's extract items and answers accurately
        lines = [l.strip() for l in gtxt.split('\n') if l.strip()]
        # Cebraspe answer key extraction:
        # Let's find all tokens C, E, X
        ans_chars = []
        for l in lines:
            # check if line has C, E, X answers
            cleaned = re.sub(r'[^CEX]', '', l)
            if len(cleaned) >= 5 and not any(w in l for w in ['SECRETARIA', 'UNIVERSIDADE', 'Aplicação', 'Cargo']):
                for ch in cleaned:
                    ans_chars.append(ch)
        if len(ans_chars) >= 120:
            for i in range(120):
                gab_map[i + 1] = ans_chars[i]
        else:
            print(f"  Warning: {gab_fn} only got {len(ans_chars)} answer chars!")
            
    exams_data[ef] = {
        'text': full_text,
        'gab_map': gab_map
    }
    print(f"  {ef}: {len(full_text)} chars, Gabarito: {len(gab_map)} itens")

# 3. Cruzar com pendentes
matched = 0
unmatched_list = []

for q in pendings:
    stmt = q['statement'].strip()
    clean_stmt = ' '.join(stmt.split())
    
    # Quebrar em sentenças
    sentences = [s.strip() for s in re.split(r'[.!?]', clean_stmt) if len(s.strip()) > 25]
    
    hit = False
    for ef, edata in exams_data.items():
        txt_norm = ' '.join(edata['text'].lower().split())
        
        # Contar sentenças encontradas
        hits = 0
        for s in sentences:
            s_norm = ' '.join(s.lower().split())
            if s_norm in txt_norm:
                hits += 1
        
        if hits >= 1:
            hit = True
            break
            
    if hit:
        matched += 1
    else:
        unmatched_list.append(q)

print(f"\n================ RESUMO CRUZAMENTO ================")
print(f"Total pendências: {len(pendings)}")
print(f"Casadas: {matched} ({matched/len(pendings)*100:.1f}%)")
print(f"Não casadas: {len(unmatched_list)}")

if unmatched_list:
    print(f"\nPrimeiras 5 não casadas:")
    for u in unmatched_list[:5]:
        print(f"  [{u['code']}] {u['statement'][:90]}...")
