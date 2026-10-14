import os, sys, json, re, unicodedata
sys.path.insert(0, os.path.abspath('.'))
from collections import defaultdict
from coletor_gabaritos.extractors.iaupe_extractor import IAUPEExtractor

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def norm(text):
    if not text: return ''
    text = unicodedata.normalize('NFKD', text)
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r'[^a-zA-Z0-9]', ' ', text).lower()
    return re.sub(r'\s+', ' ', text).strip()

def get_tokens(text):
    return set([w for w in norm(text).split() if len(w) >= 4])

def parse_ocr_questions():
    ocr_data = json.load(open('data/official_exams/SES_PE/sespe_2024_ocr_text.json', 'r', encoding='utf-8-sig'))
    # Ordena as páginas
    pages_sorted = sorted(ocr_data.items(), key=lambda x: int(x[0].replace('page_', '')))
    full_text = '\n\n'.join([v for _, v in pages_sorted])

    # Encontra números de questão "01.", "1.", "100."
    pattern = r'(?:(?:\n|\A)\s*(\d{1,3})\.\s+)|(?:QUEST(?:ÃO|O|AO)\s+(\d{1,3}))'
    matches = list(re.finditer(pattern, full_text, re.IGNORECASE))

    questions = {}
    for i, m in enumerate(matches):
        qn = int(m.group(1) or m.group(2))
        if 1 <= qn <= 100 and qn not in questions:
            s_idx = m.start()
            e_idx = matches[i+1].start() if i+1 < len(matches) else len(full_text)
            questions[qn] = full_text[s_idx:e_idx]
    return questions

def run():
    print("="*80)
    print("RESOLVENDO AS 21 QUESTÕES PENDENTES DE SES-PE 2024 COM OCR OFICIAL")
    print("="*80)

    # 1. Gabarito oficial definitivo
    iaupe_ext = IAUPEExtractor()
    gb_path = 'data/official_exams/SES_PE/SES_PE_2024_GABARITO_DEFINITIVO_ACESSO_DIRETO_2024_Repub.pdf'
    gb_res = iaupe_ext.extract(gb_path)
    ans_map = {q.numero_questao: q.alternativa for q in gb_res[0].questoes}
    status_map = {q.numero_questao: q.status for q in gb_res[0].questoes}

    # 2. Questões do caderno OCR
    b_qs = parse_ocr_questions()
    print(f"Questões identificadas no caderno OCR: {len(b_qs)}/100")
    booklet_tokens = {qn: get_tokens(txt) for qn, txt in b_qs.items()}

    # 3. Carrega banco
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

    resolved_count = 0
    # Também resolve as pendentes de 2015 e 2016
    for sf, qs in db_questions_by_file.items():
        for q in qs:
            if q.get('institution') == 'SES-PE - Secretaria de Estado de Saúde de Pernambuco':
                yr = q.get('year')
                has_ans = bool((q.get('correct_answer') or '').strip() or q.get('is_anulada'))
                
                # 2015 Q12
                if yr == 2015 and not has_ans and 'hepatorrenal' in norm(q.get('statement') or ''):
                    q['correct_answer'] = 'B'
                    q['correctAnswer'] = 'B'
                    q['official_source'] = "Gabarito Oficial Definitivo IAUPE SES-PE 2015 Questão 12"
                    resolved_count += 1
                    print("Resolvido: SES-PE 2015 Q12 -> B")
                
                # 2016 Q56
                if yr == 2016 and not has_ans and 'endometrioma' in norm(q.get('statement') or ''):
                    q['correct_answer'] = 'C'
                    q['correctAnswer'] = 'C'
                    q['official_source'] = "Gabarito Oficial Definitivo IAUPE SES-PE 2016 Questão 56"
                    resolved_count += 1
                    print("Resolvido: SES-PE 2016 Q56 -> C")

                # 2024
                if yr == 2024 and not has_ans:
                    st = q.get('statement') or ''
                    q_toks = get_tokens(st)

                    best_qn = None
                    best_score = 0
                    for qn, b_toks in booklet_tokens.items():
                        inter = len(q_toks & b_toks)
                        if inter > best_score:
                            best_score = inter
                            best_qn = qn

                    st_norm = norm(st)[:50]
                    if (best_qn is None or best_score < 4) and len(st_norm) > 15:
                        for qn, b_txt in b_qs.items():
                            if st_norm in norm(b_txt):
                                best_qn = qn
                                best_score = 999
                                break

                    if best_qn and (best_score >= 4 or best_score == 999):
                        ans_oficial = ans_map.get(best_qn)
                        st_oficial = status_map.get(best_qn)
                        is_anul = (ans_oficial == 'ANULADA' or st_oficial == 'anulada')
                        final_ans = 'ANULADA' if is_anul else ans_oficial

                        q['correct_answer'] = final_ans
                        q['correctAnswer'] = final_ans
                        q['is_anulada'] = is_anul
                        q['isAnulada'] = is_anul
                        q['official_source'] = f"Gabarito Oficial Definitivo IAUPE SES-PE 2024 Questão {best_qn}"
                        q['official_audit'] = {
                            'verified': True,
                            'institution': 'SES-PE',
                            'year': 2024,
                            'question_number': best_qn,
                            'official_answer': final_ans,
                            'score': best_score
                        }
                        resolved_count += 1
                        print(f"Resolvido 2024: {q.get('code')} -> Questão {best_qn} ({final_ans})")
                    else:
                        print(f"NÃO encontrado 2024: {q.get('code')} -> best={best_qn} score={best_score} | {st[:60]}")

    print(f"\nTotal resolvido agora: {resolved_count}")

    # Salva arquivos
    for sf, qs in db_questions_by_file.items():
        with open(sf, 'w', encoding='utf-8') as fp:
            json.dump(qs, fp, ensure_ascii=False, indent=2)
        print(f"Atualizado: {sf}")

if __name__ == '__main__':
    run()
