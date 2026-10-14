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

def parse_grid_answers(pdf_path, max_q=100, page_idx=0):
    reader = pypdf.PdfReader(pdf_path)
    txt = reader.pages[page_idx].extract_text()
    
    # Quadrix format:
    # 1 2 3 4 ... 25
    # D B D B ... A
    # Extrai sequencias de letras ou X/X (anulada)
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
            
    return ans_map

def extract_quadrix_booklet(pdf_path, max_q=100):
    reader = pypdf.PdfReader(pdf_path)
    full_txt = '\n'.join([p.extract_text() or '' for p in reader.pages])
    
    pat = r'QUEST[AÃ]O\s+(\d{1,3})'
    matches = list(re.finditer(pat, full_txt, re.IGNORECASE))
    
    valid = []
    seen = set()
    for m in matches:
        qn = int(m.group(1))
        if 1 <= qn <= max_q and qn not in seen:
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
    print("RESOLVENDO SANTA CASA 2023, SANTA CASA 2020 E IAMSPE 2022")
    print("="*80)

    exams = [
        {
            'name': 'Santa Casa SP 2023',
            'inst_key': 'Santa Casa',
            'year': 2023,
            'max_q': 100,
            'gb_pdf': 'data/official_exams/SANTA_CASA_SP/SANTA_CASA_2023_GABARITO_DEFINITIVO.pdf',
            'pv_pdf': 'data/official_exams/SANTA_CASA_SP/SANTA_CASA_2023_PROVAS/QUADRIX_Cad_Prova_100-120_Prog_Acesso_Direto_ISCMSP_RM_2023.pdf',
            'gb_page': 0
        },
        {
            'name': 'Santa Casa SP 2020',
            'inst_key': 'Santa Casa',
            'year': 2020,
            'max_q': 100,
            'gb_pdf': 'data/official_exams/SANTA_CASA_SP/SANTA_CASA_2020_GABARITO_DEFINITIVO.pdf',
            'pv_pdf': 'data/official_exams/SANTA_CASA_SP/SANTA_CASA_2020_PROVAS/100_ISCMSP_RM_2020_Programa_Acesso_Direto_QUADRIX_Cad. Prova.pdf',
            'gb_page': 0
        },
        {
            'name': 'IAMSPE 2022',
            'inst_key': 'IAMSPE',
            'year': 2022,
            'max_q': 80,
            'gb_pdf': 'data/official_exams/IAMSPE/IAMSPE_2022_GABARITO_DEFINITIVO.pdf',
            'pv_pdf': 'data/official_exams/IAMSPE/IAMSPE_2022_PROVAS/QUADRIX_001_IAMSPE-RM-2022_Prova_Objetiva_ACESSO DIRETO-AREAS BASICAS.pdf',
            'gb_page': 0
        }
    ]

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

    for ex in exams:
        print(f"\n--- Processando {ex['name']} ---")
        ans_map = parse_grid_answers(ex['gb_pdf'], max_q=ex['max_q'], page_idx=ex['gb_page'])
        b_qs = extract_quadrix_booklet(ex['pv_pdf'], max_q=ex['max_q'])
        b_tokens = {qn: get_tokens(txt) for qn, txt in b_qs.items()}

        print(f"Gabarito carregado: {len(ans_map)} questões")
        print(f"Caderno extraído: {len(b_qs)} questões")

        ex_resolved = 0
        covered_qns = set()

        for sf, qs in db_questions_by_file.items():
            for q in qs:
                inst = q.get('institution') or ''
                if ex['inst_key'] in inst and q.get('year') == ex['year']:
                    st = q.get('statement') or ''
                    q_toks = get_tokens(st)

                    best_qn = None
                    best_score = 0
                    for qn, b_tok in b_tokens.items():
                        inter = len(q_toks & b_tok)
                        if inter > best_score:
                            best_score = inter
                            best_qn = qn

                    if best_qn and best_score >= 8:
                        official_ans = ans_map.get(best_qn)
                        if official_ans:
                            q['correct_answer'] = official_ans
                            q['homologated_exam'] = True
                            q['official_exam_meta'] = {
                                'institution': ex['inst_key'],
                                'year': ex['year'],
                                'exam': 'ACESSO DIRETO',
                                'question_number': best_qn,
                                'overlap_score': best_score,
                                'source': f"Quadrix Oficial Definitivo {ex['year']}"
                            }
                            ex_resolved += 1
                            covered_qns.add(best_qn)

        print(f"Resultado {ex['name']}: {ex_resolved} questões homologadas no banco ({len(covered_qns)}/{len(b_qs)} do caderno)")
        total_homologated += ex_resolved

    for sf, qs in db_questions_by_file.items():
        with open(sf, 'w', encoding='utf-8') as fp:
            json.dump(qs, fp, ensure_ascii=False, indent=2)

    print("\n" + "="*80)
    print(f"TOTAL HOMOLOGADO NOVO: {total_homologated} questões")
    print("="*80)

if __name__ == '__main__':
    run()
