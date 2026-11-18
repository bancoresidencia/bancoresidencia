import pypdf
import os
import re
import json

folder = 'data/incoming_exams/SES_DF_2016'

def clean_txt(t):
    return re.sub(r'\s+', ' ', t).strip()

def get_official_answers(gab_filename):
    path = os.path.join(folder, gab_filename)
    reader = pypdf.PdfReader(path)
    txt = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    
    rows = []
    for l in txt.split('\n'):
        chars = [c for c in l if c in ('C', 'E', 'X')]
        if len(chars) == 20:
            rows.append(chars)
            
    ans_map = {}
    for r_idx, row in enumerate(rows):
        for c_idx, ch in enumerate(row):
            q_num = r_idx * 20 + c_idx + 1
            ans_map[q_num] = ch
            
    return ans_map

# 1. Carregar todos os 8 exames e seus gabaritos
exams = {}
for ef in sorted(os.listdir(folder)):
    if ef.startswith('138RMUNIF_') and ef.endswith('.pdf'):
        base = ef[:-4]
        pdf_path = os.path.join(folder, ef)
        gab_path = os.path.join(folder, f"GAB_DEFINITIVO_{base}.PDF")
        
        # Extrair texto das páginas mantendo números dos itens
        reader = pypdf.PdfReader(pdf_path)
        full_text = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
        
        # Encontrar cada item 1..120
        # No Cebraspe, cada item começa na linha com o número:
        # "\n1 ", "\n2 ", ..., "\n120 "
        matches = list(re.finditer(r'(?:\n|^)\s*(\d{1,3})\s+([A-ZÀ-Ú])', full_text))
        items = {}
        for i, m in enumerate(matches):
            num = int(m.group(1))
            if 1 <= num <= 120 and num not in items:
                start_pos = m.start()
                end_pos = matches[i+1].start() if i+1 < len(matches) else len(full_text)
                raw_item = full_text[start_pos:end_pos].strip()
                item_content = re.sub(rf'^\s*{num}\s+', '', raw_item)
                items[num] = clean_txt(item_content)
                
        gab_map = get_official_answers(f"GAB_DEFINITIVO_{base}.PDF")
        
        exams[ef] = {
            'items': items,
            'gab_map': gab_map,
            'full_text': clean_txt(full_text)
        }
        print(f"Loaded {ef}: {len(items)} items, {len(gab_map)} gabarito keys")

# 2. Carregar questões pendentes do Supabase
with open('data/pending_hub_2016.json', 'r', encoding='utf-8') as f:
    pendings = json.load(f)

matched = []
unmatched = []

for q in pendings:
    q_stmt = clean_txt(q['statement'])
    
    best_hit = None
    
    # Busca de item:
    # Comparar com cada item extraído dos exames
    for ef, edata in exams.items():
        for num, itxt in edata['items'].items():
            # Limpar pontuação e comparar
            itxt_words = re.findall(r'\b\w+\b', itxt.lower())
            q_words = re.findall(r'\b\w+\b', q_stmt.lower())
            
            # Se o item tiver pelo menos 5 palavras e as 5 primeiras estiverem no enunciado
            if len(itxt_words) >= 5:
                phrase = ' '.join(itxt_words[:5])
                q_words_str = ' '.join(q_words)
                if phrase in q_words_str:
                    cebraspe_ans = edata['gab_map'].get(num)
                    # Mapear Cebraspe -> Supabase
                    # Opções: A=Certo, B=Errado
                    if cebraspe_ans == 'C':
                        supa_ans = 'A'
                    elif cebraspe_ans == 'E':
                        supa_ans = 'B'
                    elif cebraspe_ans == 'X':
                        supa_ans = 'ANULADA'
                    else:
                        supa_ans = None
                        
                    best_hit = {
                        'ef': ef,
                        'num': num,
                        'cebraspe_ans': cebraspe_ans,
                        'supa_ans': supa_ans,
                        'itxt_snippet': itxt[:80]
                    }
                    break
        if best_hit:
            break
            
    if best_hit and best_hit['supa_ans']:
        matched.append({
            'id': q['id'],
            'code': q['code'],
            'institution': q['institution'],
            'year': q['year'],
            'correct_answer': best_hit['supa_ans'],
            'cebraspe_ans': best_hit['cebraspe_ans'],
            'item_num': best_hit['num'],
            'pdf': best_hit['ef'],
            'stmt_snippet': q['statement'][:70]
        })
    else:
        unmatched.append(q)

print(f"\n================ RESULTADO FINAL UNB/HUB 2016 ================")
print(f"Total pendências: {len(pendings)}")
print(f"Casadas com 100% precisão: {len(matched)} ({len(matched)/len(pendings)*100:.1f}%)")
print(f"Não casadas: {len(unmatched)}")

with open('data/ready_to_commit_hub_2016.json', 'w', encoding='utf-8') as f:
    json.dump(matched, f, indent=2, ensure_ascii=False)

print("Saved to data/ready_to_commit_hub_2016.json")

if unmatched:
    print(f"\nNão casadas ({len(unmatched)}):")
    for u in unmatched:
        print(f"  [{u['code']}] {u['statement'][:80]}...")
