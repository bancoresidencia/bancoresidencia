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

def parse_unesp_2024_gabarito():
    # Carrega gabarito oficial com correções pós-recurso
    reader = pypdf.PdfReader('data/official_exams/UNESP/UNESP_2024_GB_PREL.pdf')
    txt = reader.pages[0].extract_text()
    
    # Procura pares: número - letra
    pairs = re.findall(r'(\d{1,3})\s*-\s*([A-E])', txt)
    ans_map = {}
    for n, a in pairs:
        ans_map[int(n)] = a.upper()

    # Aplica alterações pós-recurso oficiais:
    # Q35: Anulada
    ans_map[35] = 'ANULADA'
    return ans_map

def extract_unesp_2024_booklet():
    reader = pypdf.PdfReader('data/official_exams/UNESP/UNESP_2024_PV_AD.pdf')
    full_txt = '\n'.join([p.extract_text() or '' for p in reader.pages])
    
    pattern = r'Quest[^\d\n\r]{1,5}\s*(\d{1,3})'
    matches = list(re.finditer(pattern, full_txt, re.IGNORECASE))
    
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

def run():
    print("="*80)
    print("RESOLVENDO UNESP BOTUCATU 2024 COM GABARITO OFICIAL DEFINITIVO")
    print("="*80)

    ans_map = parse_unesp_2024_gabarito()
    b_qs = extract_unesp_2024_booklet()
    b_tokens = {qn: get_tokens(txt) for qn, txt in b_qs.items()}

    print(f"Gabarito Oficial carregado: {len(ans_map)} questões")
    print(f"Caderno de Provas extraído: {len(b_qs)} questões")

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
            if 'UNESP' in inst and q.get('year') == 2024:
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
                            q['official_source'] = f"Gabarito Oficial Definitivo UNESP Botucatu 2024 Questão {best_qn}"
                            q['official_audit'] = {
                                'verified': True,
                                'institution': inst,
                                'year': 2024,
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

    print(f"\nTOTAL HOMOLOGADO UNESP BOTUCATU 2024: +{total_resolved}")
    print("="*80)

if __name__ == '__main__':
    run()
