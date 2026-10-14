import os, sys, json, re, unicodedata, pypdf
sys.path.insert(0, os.path.abspath('.'))
from coletor_gabaritos.extractors.amrigs_extractor import AMRIGSExtractor

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

def extract_booklet_questions(pdf_path):
    reader = pypdf.PdfReader(pdf_path)
    full_text = '\n'.join([p.extract_text() or '' for p in reader.pages])
    pattern = r'(?:(?:\n|\A)\s*QUEST[AÃ]O\s+(\d{1,3}))|(?:(?:\n|\A)\s*(\d{1,3})\s*[\.-]\s+)'
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
    print("HOMOLOGAÇÃO OFICIAL AMRIGS (2023, 2024, 2025)")
    print("="*80)

    amrigs_ext = AMRIGSExtractor()

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

    for yr in [2025, 2024, 2023]:
        pv_path = f'data/official_exams/AMRIGS/AMRIGS_{yr}_PROVA.pdf'
        gb_path = f'data/official_exams/AMRIGS/AMRIGS_{yr}_GABARITO.pdf'
        if not (os.path.exists(pv_path) and os.path.exists(gb_path)):
            continue

        gb_res = amrigs_ext.extract(gb_path)[0]
        ans_map = {q.numero_questao: q.alternativa for q in gb_res.questoes}
        status_map = {q.numero_questao: q.status for q in gb_res.questoes}
        b_qs = extract_booklet_questions(pv_path)
        booklet_tokens = {qn: get_tokens(txt) for qn, txt in b_qs.items()}

        print(f"\n[AMRIGS {yr}] Caderno com {len(b_qs)}q | Gabarito Definitivo com {len(ans_map)} respostas")

        yr_resolved = 0
        for sf, qs in db_questions_by_file.items():
            for q in qs:
                if 'AMRIGS' in (q.get('institution') or '') and q.get('year') == yr:
                    st = q.get('statement') or ''
                    q_toks = get_tokens(st)

                    best_qn = None
                    best_score = 0
                    for qn, b_toks in booklet_tokens.items():
                        inter = len(q_toks & b_toks)
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
                        st_oficial = status_map.get(best_qn)
                        if ans_oficial:
                            curr_ans = (q.get('correct_answer') or '').strip()
                            is_anul = (ans_oficial == 'ANULADA' or st_oficial == 'anulada')
                            final_ans = 'ANULADA' if is_anul else ans_oficial

                            if not curr_ans or curr_ans != final_ans:
                                q['correct_answer'] = final_ans
                                q['correctAnswer'] = final_ans
                                q['is_anulada'] = is_anul
                                q['isAnulada'] = is_anul
                                q['official_source'] = f"Gabarito Oficial Definitivo AMRIGS / Fundatec {yr} Questão {best_qn}"
                                q['official_audit'] = {
                                    'verified': True,
                                    'institution': 'AMRIGS',
                                    'year': yr,
                                    'question_number': best_qn,
                                    'official_answer': final_ans,
                                    'score': best_score
                                }
                                yr_resolved += 1
                                total_resolved += 1

        print(f"  -> Questões resolvidas/atualizadas em AMRIGS {yr}: {yr_resolved}")

    # Salva arquivos
    if total_resolved > 0:
        for sf, qs in db_questions_by_file.items():
            with open(sf, 'w', encoding='utf-8') as fp:
                json.dump(qs, fp, ensure_ascii=False, indent=2)
            print(f"Atualizado: {sf}")

    print(f"\nTOTAL HOMOLOGADO AMRIGS: {total_resolved}")

if __name__ == '__main__':
    run()
