import fitz, re, os

def parse_uerj_gabarito(pdf_path):
    doc = fitz.open(pdf_path)
    text = doc[0].get_text()
    
    # 2025 e 2026: R1 R2 ... R20 seguido pelas letras B D B ...
    # 2022, 2023, 2024: R1 ... R100 seguido por todas as letras
    
    # Vamos procurar blocos
    # Uma forma robusta: pegar palavras ou tokens
    tokens = text.split()
    
    # Se tiver pares Rn e letra ou blocos Rn... e Letras...
    gabarito = {}
    
    # Testar se os R são seguidos pelas respostas
    # Vamos achar os índices dos "R1", "R2", etc.
    # Ou achar sequências de R\d+
    r_indices = [i for i, t in enumerate(tokens) if re.match(r'^R\d+$', t)]
    
    # Se os R vêm em blocos:
    # Exemplo: R1..R20, depois letras 1..20, depois R21..R40, depois letras 21..40
    # Vamos testar esse padrão
    curr_r_batch = []
    i = 0
    while i < len(tokens):
        t = tokens[i]
        if re.match(r'^R\d+$', t):
            curr_r_batch.append(int(t[1:]))
            i += 1
        elif curr_r_batch:
            # Encontrou o fim dos R, agora vêm as letras para esse batch!
            for r_num in curr_r_batch:
                if i < len(tokens):
                    ans = tokens[i].upper()
                    if ans in ['A', 'B', 'C', 'D', 'E', 'X']:
                        gabarito[r_num] = ans
                    i += 1
            curr_r_batch = []
        else:
            i += 1
            
    return gabarito

for y in [2022, 2023, 2024, 2025, 2026]:
    p = f'data/official_exams/UERJ/UERJ_{y}_GB_DEF.pdf'
    gb = parse_uerj_gabarito(p)
    print(f'UERJ {y}: {len(gb)} questões extraídas')
    print(f'  1..10: {[gb.get(k) for k in range(1, 11)]}')
    print(f'  50..60: {[gb.get(k) for k in range(50, 61)]}')
