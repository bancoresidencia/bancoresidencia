import os, sys, json, re, unicodedata

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath('.'))

from coletor_gabaritos.extractors.usp_extractor import USPExtractor

def norm(text):
    if not text: return ''
    text = unicodedata.normalize('NFKD', text)
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r'[^a-zA-Z0-9]', ' ', text).lower()
    return re.sub(r'\s+', ' ', text).strip()

def get_tokens(text):
    return set([w for w in norm(text).split() if len(w) >= 4])

def extract_usp_2024_booklet():
    with open('data/official_exams/USP_FUVEST/usp_2024_ocr_text.json', 'r', encoding='utf-8-sig') as f:
        ocr_map = json.load(f)

    pages = []
    for p in range(3, 39):
        k = f"page_{p:02d}"
        txt = ocr_map.get(k, '')
        txt = re.sub(r'Processo Seletivo aos Programas.*?PROVA AI\s*', '', txt)
        txt = re.sub(r'PAG \d+/\d+.*$', '', txt, flags=re.MULTILINE)
        pages.append(txt)

    full_txt = '\n'.join(pages)

    # Coleta de posições com regras mais completas
    q_positions = {}
    for qn in range(1, 121):
        q_str = f"{qn:02d}" if qn < 100 else f"{qn}"
        patterns = [
            rf'(?:^|\n|\s){q_str}\s+([A-ZÀ-Ú])',
            rf'(?:^|\n|\s){qn}\s+([A-ZÀ-Ú])',
            rf'\b{q_str}\b',
            rf'\b{qn}\b'
        ]
        found_pos = None
        for pat in patterns:
            for m in re.finditer(pat, full_txt):
                pos = m.start()
                # Verifica contexto próximo
                snippet = full_txt[pos:pos+150]
                if any(w in norm(snippet) for w in ['paciente', 'mulher', 'homem', 'lactente', 'crianca', 'assinale', 'quadro', 'edital', 'fluxo', 'caso']):
                    found_pos = pos
                    break
            if found_pos is not None:
                break
        if found_pos is not None:
            q_positions[qn] = found_pos

    # Extrai fatias de texto para cada questão
    sorted_q = sorted(q_positions.items(), key=lambda x: x[1])
    questions_text = {}
    for i, (qn, pos) in enumerate(sorted_q):
        end_pos = sorted_q[i+1][1] if i + 1 < len(sorted_q) else len(full_txt)
        questions_text[qn] = full_txt[pos:end_pos]

    return questions_text

def run():
    print("="*80)
    print("RESOLVENDO USP FUVEST 2024 (HCFMUSP E HCRP)")
    print("="*80)

    # 1. Carrega Gabarito Definitivo Prova A1
    ext = USPExtractor()
    gb_results = ext.extract('data/official_exams/USP_FUVEST/USP_FUVEST_2024_GB.pdf')
    prova_a1 = next((r for r in gb_results if 'A1' in r.versao_caderno), None)
    ans_map = {}
    for q in prova_a1.questoes:
        ans_map[q.numero_questao] = 'ANULADA' if q.status == 'anulada' else q.alternativa

    print(f"Gabarito Oficial A1 carregado: {len(ans_map)} questões")

    # 2. Extrai Caderno Prova A1 do OCR
    b_qs = extract_usp_2024_booklet()
    print(f"Caderno Prova A1 extraído: {len(b_qs)} questões identificadas")
    b_tokens = {qn: get_tokens(txt) for qn, txt in b_qs.items()}

    # 3. Carrega arquivos do banco
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

    total_resolved = 0

    for sf, qs in db_questions_by_file.items():
        file_resolved = 0
        for q in qs:
            inst = q.get('institution') or ''
            if ('USP' in inst or 'FUVEST' in inst) and q.get('year') == 2024:
                st = q.get('statement') or ''
                q_toks = get_tokens(st)

                best_qn = None
                best_score = 0
                for qn, b_tok in b_tokens.items():
                    inter = len(q_toks & b_tok)
                    if inter > best_score:
                        best_score = inter
                        best_qn = qn

                st_norm = norm(st)[:40]
                if (best_qn is None or best_score < 4) and len(st_norm) > 15:
                    for qn, b_txt in b_qs.items():
                        if st_norm in norm(b_txt):
                            best_qn = qn
                            best_score = 999
                            break

                if best_qn and (best_score >= 4 or best_score == 999):
                    ans_oficial = ans_map.get(best_qn)
                    if ans_oficial:
                        curr_ans = (q.get('correct_answer') or '').strip()
                        is_anul = (ans_oficial == 'ANULADA')
                        final_ans = 'ANULADA' if is_anul else ans_oficial

                        if not curr_ans or curr_ans != final_ans:
                            q['correct_answer'] = final_ans
                            q['correctAnswer'] = final_ans
                            q['is_anulada'] = is_anul
                            q['isAnulada'] = is_anul
                            q['official_source'] = f"Gabarito Oficial Definitivo USP FUVEST 2024 Prova A1 Questão {best_qn}"
                            q['official_audit'] = {
                                'verified': True,
                                'institution': inst,
                                'year': 2024,
                                'prova': 'A1',
                                'question_number': best_qn,
                                'official_answer': final_ans,
                                'score': best_score
                            }
                            file_resolved += 1
                            total_resolved += 1

        if file_resolved > 0:
            print(f"  -> {sf}: +{file_resolved} questões homologadas")

    if total_resolved > 0:
        for sf, qs in db_questions_by_file.items():
            with open(sf, 'w', encoding='utf-8') as fp:
                json.dump(qs, fp, ensure_ascii=False, indent=2)
            print(f"Gravado: {sf}")

    print(f"\nTOTAL HOMOLOGADO USP FUVEST 2024: +{total_resolved}")
    print("="*80)

if __name__ == '__main__':
    run()
