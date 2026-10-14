import os, sys, json, re, unicodedata, pypdf
sys.path.insert(0, os.path.abspath('.'))

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

def parse_quadrix_gabarito(pdf_path, max_q=100):
    r = pypdf.PdfReader(pdf_path)
    full_txt = '\n'.join([p.extract_text() or '' for p in r.pages])
    lines = [l.strip() for l in full_txt.split('\n') if l.strip()]
    res = {}
    for i in range(len(lines) - 1):
        nums = lines[i].split()
        anss = lines[i+1].split()
        if len(nums) >= 5 and len(nums) == len(anss):
            if all(n.isdigit() for n in nums) and all(a.upper() in ['A','B','C','D','E','*','X','ANULADA'] for a in anss):
                for n, a in zip(nums, anss):
                    n_int = int(n)
                    if 1 <= n_int <= max_q:
                        res[n_int] = 'ANULADA' if a in ['*','X','ANULADA'] else a.upper()
    if len(res) < max_q // 2:
        pairs = re.findall(r'\b(\d{1,3})\s*[-–.)\t ]\s*([A-E]|ANULADA|X|\*)\b', full_txt, re.I)
        for n, a in pairs:
            if 1 <= int(n) <= max_q:
                res[int(n)] = 'ANULADA' if a.upper() in ['*','X','ANULADA'] else a.upper()
    return res

def extract_quadrix_booklet(pdf_path, max_q=100):
    r = pypdf.PdfReader(pdf_path)
    full_txt = '\n'.join([p.extract_text() or '' for p in r.pages])
    pattern = r'(?:QUE)?ST[AÃ]O\s+(\d{1,3})\b'
    matches = list(re.finditer(pattern, full_txt, re.IGNORECASE))
    
    # Filtra e ordena
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
    print("RESOLVENDO GABARITOS OFICIAIS: SUS-SP (2022, 2023) E IAMSPE (2023)")
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

    jobs = [
        {
            'institution_match': 'SUS-SP',
            'year': 2023,
            'max_q': 100,
            'pv': 'data/official_exams/SUS_SP/SUS_SP_2023_PROVAS/100-121_PROGRAMAS DE ACESSO DIRETO_prova_objetiva_SES-SP_RM_2023_QUADRIX.pdf',
            'gb': 'data/official_exams/SUS_SP/SUS_SP_2023_GABARITO_DEFINITIVO.pdf',
            'label': 'SUS-SP 2023'
        },
        {
            'institution_match': 'SUS-SP',
            'year': 2022,
            'max_q': 100,
            'pv': 'data/official_exams/SUS_SP/SUS_SP_2022_PROVAS/QUADRIX_001_SES-SP-RM-2022_Prova_Objetiva_ACESSO DIRETO-AREAS BASICAS_.pdf',
            'gb': 'data/official_exams/SUS_SP/SUS_SP_2022_GABARITO_DEFINITIVO.pdf',
            'label': 'SUS-SP 2022'
        },
        {
            'institution_match': 'IAMSPE',
            'year': 2023,
            'max_q': 80,
            'pv': 'data/official_exams/IAMSPE/IAMSPE_2023_PROVAS/QUADRIX_Prova_Objetiva_001_Prog_Acesso_Direto_IAMSPE_RM_2023.pdf',
            'gb': 'data/official_exams/IAMSPE/IAMSPE_2023_GABARITO_DEFINITIVO.pdf',
            'label': 'IAMSPE 2023'
        }
    ]

    total_resolved = 0

    for job in jobs:
        label = job['label']
        pv_path, gb_path = job['pv'], job['gb']
        max_q = job['max_q']

        ans_map = parse_quadrix_gabarito(gb_path, max_q)
        b_qs = extract_quadrix_booklet(pv_path, max_q)
        b_tokens = {qn: get_tokens(txt) for qn, txt in b_qs.items()}

        print(f"\n[{label}] Caderno com {len(b_qs)}/{max_q}q | Gabarito Definitivo com {len(ans_map)}/{max_q} respostas")

        job_resolved = 0
        for sf, qs in db_questions_by_file.items():
            for q in qs:
                inst_name = q.get('institution') or ''
                if job['institution_match'] in inst_name and q.get('year') == job['year']:
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
                                q['official_source'] = f"Gabarito Oficial Definitivo Quadrix {label} Questão {best_qn}"
                                q['official_audit'] = {
                                    'verified': True,
                                    'institution': job['institution_match'],
                                    'year': job['year'],
                                    'question_number': best_qn,
                                    'official_answer': final_ans,
                                    'score': best_score
                                }
                                job_resolved += 1
                                total_resolved += 1

        print(f"  -> Questões resolvidas/homologadas em {label}: {job_resolved}")

    # Salva arquivos
    if total_resolved > 0:
        for sf, qs in db_questions_by_file.items():
            with open(sf, 'w', encoding='utf-8') as fp:
                json.dump(qs, fp, ensure_ascii=False, indent=2)
            print(f"Gravado: {sf}")

    print(f"\nTOTAL HOMOLOGADO NESTA ETAPA: {total_resolved}")
    print("="*80)

if __name__ == '__main__':
    run()
