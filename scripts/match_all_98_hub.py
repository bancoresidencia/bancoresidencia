import json
import pypdf
import os
import re

folder = 'data/incoming_exams/SES_DF_2016'
with open('data/pending_hub_2016.json', 'r', encoding='utf-8') as f:
    pendings = json.load(f)

exam_files = sorted([f for f in os.listdir(folder) if f.startswith('138RMUNIF_') and f.endswith('.pdf')])

# Carregar textos e itens de cada prova
exams = {}
for ef in exam_files:
    path = os.path.join(folder, ef)
    reader = pypdf.PdfReader(path)
    full_text = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    
    # Extrair gabarito oficial definitivo
    base_name = ef[:-4]
    gab_fn = f"GAB_DEFINITIVO_{base_name}.PDF"
    gab_path = os.path.join(folder, gab_fn)
    gab_map = {}
    if os.path.exists(gab_path):
        greader = pypdf.PdfReader(gab_path)
        gtxt = '\n'.join([p.extract_text() for p in greader.pages if p.extract_text()])
        lines = [l.strip() for l in gtxt.split('\n') if l.strip()]
        ans_chars = []
        for l in lines:
            cleaned = re.sub(r'[^CEX]', '', l)
            if len(cleaned) >= 5 and not any(w in l for w in ['SECRETARIA', 'UNIVERSIDADE', 'Aplicação', 'Cargo']):
                for ch in cleaned:
                    ans_chars.append(ch)
        for i in range(min(120, len(ans_chars))):
            gab_map[i + 1] = ans_chars[i]
            
    # Extrair itens individuais
    # Em provas do Cebraspe, cada item começa com número seguido de espaço, ex: "\n 47 " ou "\n47 "
    # Vamos achar o início de cada item 1 a 120
    item_positions = []
    for num in range(1, 121):
        # Encontrar padrão "\n\s*num\s+[A-Z]"
        m = re.search(rf'(?:\n|^)\s*{num}\s+([A-ZÀ-Ú][^\n]+)', full_text)
        if m:
            item_positions.append((num, m.start(), m.group(1)))
            
    exams[ef] = {
        'full_text': full_text,
        'gab_map': gab_map,
        'item_positions': item_positions
    }
    print(f"{ef}: Gabarito {len(gab_map)} itens, Itens identificados por regex: {len(item_positions)}")

# Agora vamos casar cada questão pendente do Supabase
results = []
not_found = []

for q in pendings:
    q_id = q['id']
    q_code = q['code']
    stmt = q['statement']
    
    # Limpar texto do statement
    # Extrair sequência de palavras significativas (remover stopwords curtas)
    words = [w for w in re.findall(r'\b[a-zA-ZáéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ]{4,}\b', stmt.lower())]
    
    best_hit = None
    
    for ef, edata in exams.items():
        txt = edata['full_text'].lower()
        
        # Testar blocos de 4 palavras consecutivas
        hit_count = 0
        total_blocks = max(1, len(words) - 3)
        for i in range(len(words) - 3):
            block = ' '.join(words[i:i+4])
            if block in txt:
                hit_count += 1
                
        pct = (hit_count / total_blocks) * 100
        if pct >= 40: # Match robusto
            # Encontrar qual o número exato do item!
            # Para isso, buscar o trecho específico da assertiva final
            # As últimas 5 palavras da assertiva
            last_phrase = ' '.join(words[-5:]) if len(words) >= 5 else ' '.join(words)
            
            # Encontrar posição do item no texto
            item_num = None
            pos = txt.find(last_phrase)
            if pos != -1:
                # Procurar o item_position mais próximo anterior a pos
                for num, ipos, _ in reversed(edata['item_positions']):
                    if ipos <= pos + 50:
                        item_num = num
                        break
                        
            # Se achou item_num, pegar gabarito
            official_ans = edata['gab_map'].get(item_num) if item_num else None
            
            # Mapeamento Cebraspe -> Supabase
            # C -> A, E -> B, X -> ANULADA
            supa_ans = None
            if official_ans == 'C':
                supa_ans = 'A'
            elif official_ans == 'E':
                supa_ans = 'B'
            elif official_ans == 'X':
                supa_ans = 'ANULADA'
                
            best_hit = {
                'pdf': ef,
                'pct': pct,
                'item_num': item_num,
                'cebraspe_ans': official_ans,
                'supa_ans': supa_ans
            }
            break
            
    if best_hit and best_hit['supa_ans']:
        results.append((q, best_hit))
    else:
        not_found.append((q, best_hit))

print(f"\n================ RESULTADO FINAL ================")
print(f"Total pendentes analisadas: {len(pendings)}")
print(f"Casadas com gabarito oficial: {len(results)} ({len(results)/len(pendings)*100:.1f}%)")
print(f"Sem gabarito / não casadas: {len(not_found)}")

if results:
    print(f"\nPrimeiros 10 casamentos:")
    for q, hit in results[:10]:
        print(f"  {q['code']} -> {hit['pdf']} Item {hit['item_num']} (Cebraspe: {hit['cebraspe_ans']} => Supabase: {hit['supa_ans']})")

if not_found:
    print(f"\nPrimeiros 5 não casados:")
    for q, hit in not_found[:5]:
        print(f"  {q['code']}: hit={hit} stmt={q['statement'][:60]}...")
