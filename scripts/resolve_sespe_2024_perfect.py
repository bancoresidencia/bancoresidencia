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

def parse_all_100_questions():
    ocr_data = json.load(open('data/official_exams/SES_PE/sespe_2024_ocr_text.json', 'r', encoding='utf-8-sig'))
    all_txt = '\n\n'.join([ocr_data[f'page_{i:02d}'] for i in range(1, 29)])

    # Encontra números de questão "1.", "01.", etc.
    matches = list(re.finditer(r'(?:^|\s)(\d{1,2}|100)\.\s+([A-ZÀ-Úa-z])', all_txt))
    
    questions = {}
    for i, m in enumerate(matches):
        qn = int(m.group(1))
        # Queremos o trecho da questão até o próximo número
        s_idx = m.start()
        e_idx = matches[i+1].start() if i+1 < len(matches) else len(all_txt)
        txt = all_txt[s_idx:e_idx]
        # Se qn já existe (por falso positivo de número menor no meio), só sobrescreve se o novo for mais coerente com a ordem
        if qn not in questions or len(txt) > len(questions[qn]):
            questions[qn] = txt

    return questions

def run():
    print("="*80)
    print("HOMOLOGAÇÃO PERFEITA SES-PE 2024 (100 QUESTÕES)")
    print("="*80)

    # 1. Gabarito oficial definitivo 2024
    iaupe_ext = IAUPEExtractor()
    gb_path = 'data/official_exams/SES_PE/SES_PE_2024_GABARITO_DEFINITIVO_ACESSO_DIRETO_2024_Repub.pdf'
    gb_res = iaupe_ext.extract(gb_path)
    ans_map = {q.numero_questao: q.alternativa for q in gb_res[0].questoes}
    status_map = {q.numero_questao: q.status for q in gb_res[0].questoes}
    print(f"Gabarito Oficial Definitivo 2024: {len(ans_map)} questões")

    # 2. Questões do caderno OCR
    b_qs = parse_all_100_questions()
    print(f"Caderno OCR: {len(b_qs)} questões únicas identificadas")
    b_tokens = {qn: get_tokens(txt) for qn, txt in b_qs.items()}

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

    resolved_count = 0
    matched_qns = set()

    for sf in specialty_files:
        if not os.path.exists(sf): continue
        with open(sf, 'r', encoding='utf-8') as fp:
            qs = json.load(fp)
        
        modified = False
        for q in qs:
            if q.get('institution') == 'SES-PE - Secretaria de Estado de Saúde de Pernambuco' and q.get('year') == 2024:
                st = q.get('statement') or ''
                q_toks = get_tokens(st)

                best_qn = None
                best_score = 0
                for qn, b_tok in b_tokens.items():
                    inter = len(q_toks & b_tok)
                    if inter > best_score:
                        best_score = inter
                        best_qn = qn

                # Verbatim check
                st_norm = norm(st)[:40]
                if st_norm:
                    for qn, b_txt in b_qs.items():
                        if st_norm in norm(b_txt):
                            best_qn = qn
                            best_score = 999
                            break

                if best_qn and best_score >= 5:
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
                    matched_qns.add(best_qn)
                    modified = True
                    print(f"  [OK] {q.get('code')}: Questão {best_qn:02d} -> Gabarito {final_ans} (score={best_score})")
                else:
                    print(f"  [PENDENTE/BAIXO SCORE] {q.get('code')} score={best_score} | {st[:50]}")

        if modified:
            with open(sf, 'w', encoding='utf-8') as fp:
                json.dump(qs, fp, ensure_ascii=False, indent=2)

    print(f"\nTotal de questões SES-PE 2024 homologadas com sucesso: {resolved_count}")
    print(f"Questões oficiais cobertas: {len(matched_qns)}/100")

if __name__ == '__main__':
    run()
