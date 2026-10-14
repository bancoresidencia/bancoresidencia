import os, sys, json, re, unicodedata, pypdf

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath('.'))

def norm(text):
    if not text: return ''
    text = unicodedata.normalize('NFKD', text)
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r'[^a-zA-Z0-9]', ' ', text).lower()
    return re.sub(r'\s+', ' ', text).strip()

def get_tokens(text):
    return set([w for w in norm(text).split() if len(w) >= 4])

def parse_santa_casa_2021():
    pdf_path = 'data/official_exams/SANTA_CASA_SP/SANTA_CASA_2021_GABARITO_DEFINITIVO.pdf'
    reader = pypdf.PdfReader(pdf_path)
    txt = reader.pages[0].extract_text()
    
    # Isola o bloco ACESSO DIRETO
    if 'PROGRAMAS COM PR' in txt:
        txt = txt.split('PROGRAMAS COM PR')[0]
        
    lines = [l.strip() for l in txt.split('\n') if l.strip()]
    ans_map = {}
    current_numbers = []
    
    for line in lines:
        tokens = line.split()
        if all(t.isdigit() for t in tokens) and len(tokens) >= 5:
            current_numbers = [int(t) for t in tokens]
        elif current_numbers and len(tokens) == len(current_numbers):
            for num, ans in zip(current_numbers, tokens):
                ans_clean = ans.upper()
                if ans_clean in ['X', '*']:
                    ans_map[num] = 'ANULADA'
                elif ans_clean in ['A', 'B', 'C', 'D', 'E']:
                    ans_map[num] = ans_clean
            current_numbers = []
            
    # Garantir anulações oficiais expressas no edital
    for ann_q in [12, 34, 54, 85, 92]:
        ans_map[ann_q] = 'ANULADA'
    return ans_map

def extract_santa_casa_2021_booklet():
    pdf_path = 'data/official_exams/SANTA_CASA_SP/SANTA_CASA_2021_PROVAS/QUADRIX_Cad_Prova_001_Programa_Acesso_Direto_ISCMSP_RM-2021.pdf'
    reader = pypdf.PdfReader(pdf_path)
    full_txt = '\n'.join([p.extract_text() or '' for p in reader.pages])
    
    pat = r'QUEST[AÃ]O\s+(\d{1,3})'
    matches = list(re.finditer(pat, full_txt, re.IGNORECASE))
    
    valid = []
    seen = set()
    for m in matches:
        qn = int(m.group(1))
        if 1 <= qn <= 100 and qn not in seen:
            seen.add(qn)
            valid.append((qn, m.start()))
            
    valid = sorted(valid, key=lambda x: x[1])
    questions = {}
    for i, (qn, s_idx) in enumerate(valid):
        e_idx = valid[i+1][1] if i+1 < len(valid) else len(full_txt)
        questions[qn] = full_txt[s_idx:e_idx]
    return questions

def parse_fuvest_2023():
    pdf_path = 'data/official_exams/USP_FUVEST/USP_FUVEST_2023_GB.pdf'
    reader = pypdf.PdfReader(pdf_path)
    txt = reader.pages[0].extract_text()
    
    lines = [l.strip() for l in txt.split('\n') if l.strip()]
    ans_map = {}
    for l in lines:
        m = re.match(r'^(\d{1,3})\s+(.*)$', l)
        if m:
            qn = int(m.group(1))
            val = m.group(2).strip()
            if '*' in val:
                ans_map[qn] = 'ANULADA'
            elif len(val) >= 1:
                # Ex: 'A D' aceita A ou D -> pegamos a primeira alternativa válida ou o conjunto
                first_letter = val.split()[0].upper()
                if first_letter in ['A', 'B', 'C', 'D', 'E']:
                    ans_map[qn] = first_letter
    return ans_map

def extract_fuvest_2023_booklet():
    pdf_path = 'data/official_exams/USP_FUVEST/USP_FUVEST_2023_PV.pdf'
    reader = pypdf.PdfReader(pdf_path)
    full_txt = '\n'.join([p.extract_text() or '' for p in reader.pages])
    
    # FUVEST pattern: número seguido de ponto no início de parágrafo ou QUESTÃO
    pat = r'(?:(?:\n|\A)\s*(\d{1,3})\s*\.\s+)|(?:QUEST[AÃ]O\s+(\d{1,3}))'
    matches = list(re.finditer(pat, full_txt, re.IGNORECASE))
    
    valid = []
    seen = set()
    for m in matches:
        qn = int(m.group(1) or m.group(2))
        if 1 <= qn <= 120 and qn not in seen:
            seen.add(qn)
            valid.append((qn, m.start()))
            
    valid = sorted(valid, key=lambda x: x[1])
    questions = {}
    for i, (qn, s_idx) in enumerate(valid):
        e_idx = valid[i+1][1] if i+1 < len(valid) else len(full_txt)
        questions[qn] = full_txt[s_idx:e_idx]
    return questions

def run():
    print("="*80)
    print("INTEGRAÇÃO E RESOLUÇÃO DO LOTE 1 (SANTA CASA SP 2021 + FUVEST USP 2023)")
    print("Garantindo rastreamento das 7 Especialidades Médicas")
    print("="*80)

    specialty_files = [
        'data/clinica_medica_final_questions.json',
        'data/cirurgia_final_questions.json',
        'data/pediatria_final_questions.json',
        'data/ginecologia_final_questions.json',
        'data/medicina_preventiva_final_questions.json',
        'data/obstetricia_final_questions.json',
        'data/urologia_final_questions.json'
    ]

    db_questions_by_file = {}
    for sf in specialty_files:
        if os.path.exists(sf):
            with open(sf, 'r', encoding='utf-8') as fp:
                db_questions_by_file[sf] = json.load(fp)

    total_homologated = 0

    # 1. Processar Santa Casa SP 2021
    print("\n--- 1. Homologando Santa Casa SP 2021 ---")
    sc_ans = parse_santa_casa_2021()
    sc_book = extract_santa_casa_2021_booklet()
    sc_tokens = {qn: get_tokens(txt) for qn, txt in sc_book.items()}
    print(f"Santa Casa 2021: {len(sc_ans)} gabaritos | {len(sc_book)} questões no caderno")

    sc_resolved = 0
    sc_covered_qns = set()

    for sf, qs in db_questions_by_file.items():
        spec_name = os.path.basename(sf).replace('_final_questions.json', '')
        for q in qs:
            inst = q.get('institution') or ''
            if 'Santa Casa' in inst and q.get('year') == 2021:
                st = q.get('statement') or ''
                q_toks = get_tokens(st)

                best_qn = None
                best_score = 0
                for qn, b_tok in sc_tokens.items():
                    inter = len(q_toks & b_tok)
                    if inter > best_score:
                        best_score = inter
                        best_qn = qn

                st_norm = norm(st)[:50]
                if (best_qn is None or best_score < 6) and len(st_norm) > 15:
                    for qn, b_txt in sc_book.items():
                        if st_norm in norm(b_txt):
                            best_qn = qn
                            best_score = 99
                            break

                if best_qn and (best_score >= 6 or best_score == 99):
                    ans_oficial = sc_ans.get(best_qn)
                    if ans_oficial:
                        curr_ans = (q.get('correct_answer') or '').strip()
                        is_anul = (ans_oficial == 'ANULADA')
                        q['correct_answer'] = 'ANULADA' if is_anul else ans_oficial
                        q['is_anulada'] = is_anul
                        q['homologated_exam'] = True
                        q['official_exam_meta'] = {
                            'institution': 'Santa Casa de São Paulo',
                            'year': 2021,
                            'exam': 'ACESSO DIRETO',
                            'question_number': best_qn,
                            'overlap_score': best_score,
                            'source': 'Quadrix Oficial Definitivo 2021 (CID 1243)'
                        }
                        sc_resolved += 1
                        sc_covered_qns.add(best_qn)

    print(f"Resultado Santa Casa SP 2021: {sc_resolved} questões homologadas ({len(sc_covered_qns)}/100 do caderno)")
    total_homologated += sc_resolved

    # 2. Processar USP / FUVEST 2023 (para HCFMUSP e HCRP Ribeirão Preto)
    print("\n--- 2. Homologando FUVEST 2023 (USP SP + USP Ribeirão) ---")
    fuvest_ans = parse_fuvest_2023()
    fuvest_book = extract_fuvest_2023_booklet()
    fuvest_tokens = {qn: get_tokens(txt) for qn, txt in fuvest_book.items()}
    print(f"FUVEST 2023: {len(fuvest_ans)} gabaritos | {len(fuvest_book)} questões no caderno")

    fuvest_resolved = 0
    fuvest_covered_qns = set()

    for sf, qs in db_questions_by_file.items():
        spec_name = os.path.basename(sf).replace('_final_questions.json', '')
        for q in qs:
            inst = q.get('institution') or ''
            is_usp = ('USP' in inst or 'FUVEST' in inst) and q.get('year') == 2023
            if is_usp:
                st = q.get('statement') or ''
                q_toks = get_tokens(st)

                best_qn = None
                best_score = 0
                for qn, b_tok in fuvest_tokens.items():
                    inter = len(q_toks & b_tok)
                    if inter > best_score:
                        best_score = inter
                        best_qn = qn

                st_norm = norm(st)[:50]
                if (best_qn is None or best_score < 6) and len(st_norm) > 15:
                    for qn, b_txt in fuvest_book.items():
                        if st_norm in norm(b_txt):
                            best_qn = qn
                            best_score = 99
                            break

                if best_qn and (best_score >= 6 or best_score == 99):
                    ans_oficial = fuvest_ans.get(best_qn)
                    if ans_oficial:
                        curr_ans = (q.get('correct_answer') or '').strip()
                        is_anul = (ans_oficial == 'ANULADA')
                        q['correct_answer'] = 'ANULADA' if is_anul else ans_oficial
                        q['is_anulada'] = is_anul
                        q['homologated_exam'] = True
                        q['official_exam_meta'] = {
                            'institution': inst,
                            'year': 2023,
                            'exam': 'ACESSO DIRETO - PROVA A',
                            'question_number': best_qn,
                            'overlap_score': best_score,
                            'source': 'FUVEST Oficial Retificado 2023'
                        }
                        fuvest_resolved += 1
                        fuvest_covered_qns.add(best_qn)

    print(f"Resultado FUVEST 2023: {fuvest_resolved} questões homologadas ({len(fuvest_covered_qns)} cadernos correspondidos)")
    total_homologated += fuvest_resolved

    # Salva arquivos de especialidades
    print("\n--- Gravando atualizações nos 7 arquivos de especialidades ---")
    for sf, qs in db_questions_by_file.items():
        with open(sf, 'w', encoding='utf-8') as fp:
            json.dump(qs, fp, ensure_ascii=False, indent=2)
        print(f"Salvo: {sf}")

    print("\n" + "="*80)
    print(f"TOTAL GERAL HOMOLOGADO NESTA ETAPA: +{total_homologated} questões")
    print("="*80)

if __name__ == '__main__':
    run()
