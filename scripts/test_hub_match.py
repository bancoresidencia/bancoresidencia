import json
import pypdf
import re
from difflib import SequenceMatcher

# 1. Carregar questões pendentes do Supabase
with open('data/pending_hub_2016.json', 'r', encoding='utf-8') as f:
    pendings = json.load(f)

print(f"Total pendentes carregadas: {len(pendings)}")

# 2. Extrair texto completo dos dois exames
exams = {}
for fn in ['138RMUNIF_001_01.pdf', '138RMUNIF_002_02.pdf']:
    path = f'data/incoming_exams/SES_DF_2016/{fn}'
    reader = pypdf.PdfReader(path)
    full_text = '\n'.join([p.extract_text() for p in reader.pages if p.extract_text()])
    exams[fn] = full_text

# 3. Testar correspondência para cada questão pendente
matched = []
unmatched = []

for q in pendings:
    q_id = q['id']
    q_code = q['code']
    stmt = q['statement'].strip()
    
    # Pegar os últimos 80 caracteres do enunciado (que é onde fica a afirmação específica do item)
    # ou procurar trechos significativos
    best_match = None
    
    for fn, txt in exams.items():
        # Procurar trecho de 40 a 60 caracteres do final da questão ou da afirmação
        # Limpar pontuação e quebras de linha
        clean_stmt = ' '.join(stmt.split())
        
        # Testar se partes do clean_stmt estão no texto do PDF
        # Vamos dividir em frases
        sentences = [s.strip() for s in re.split(r'[.!?]', clean_stmt) if len(s.strip()) > 25]
        
        # Procurar as frases no PDF
        found_in_pdf = False
        matching_sentences = 0
        for s in sentences:
            # normalizar
            s_norm = ' '.join(s.lower().split())
            txt_norm = ' '.join(txt.lower().split())
            if s_norm in txt_norm:
                matching_sentences += 1
                found_in_pdf = True
        
        if found_in_pdf:
            best_match = (fn, matching_sentences, len(sentences))
            break
            
    if best_match:
        matched.append((q, best_match))
    else:
        unmatched.append(q)

print(f"\nResultado da busca direta:")
print(f"  Casadas com os 2 PDFs: {len(matched)} / {len(pendings)}")
print(f"  Não casadas: {len(unmatched)}")

if unmatched:
    print("\nExemplos de não casadas:")
    for u in unmatched[:5]:
        print(f"  [{u['code']}] {u['statement'][:100]}...")
