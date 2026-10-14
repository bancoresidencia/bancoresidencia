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

def parse_unifesp_2024_gabarito():
    reader = pypdf.PdfReader('data/official_exams/UNIFESP/UNIFESP_2024_GB_PREL.pdf')
    txt = '\n'.join([p.extract_text() or '' for p in reader.pages])
    
    pairs = re.findall(r'(\d{1,3})\s*[-:]?\s*([A-E])', txt)
    ans_map = {}
    for n, a in pairs:
        ans_map[int(n)] = a.upper()

    # Aplica alterações pós-recurso oficiais do resultado definitivo (Acesso Direto)
    # Q7: C
    # Q47: B e C aceitas
    # Q62: C
    # Q68: B e C aceitas
    # Q100: B e C aceitas
    ans_map[7] = 'C'
    ans_map[47] = 'B' # Aceitas B e C
    ans_map[62] = 'C'
    ans_map[68] = 'B' # Aceitas B e C
    ans_map[100] = 'B' # Aceitas B e C
    
    return ans_map

def extract_unifesp_2024_booklet():
    reader = pypdf.PdfReader('data/official_exams/UNIFESP/UNIFESP_2024_PV_AD.pdf')
    full_txt = '\n'.join([p.extract_text() or '' for p in reader.pages])
    
    pattern = r'(?:^|\n)\s*(\d{1,3})\.\s+([A-ZÀ-Ú])'
    matches = list(re.finditer(pattern, full_txt))
    
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
    print("RESOLVENDO UNIFESP 2024 COM GABARITO OFICIAL DEFINITIVO")
    print("="*80)

    ans_map = parse_unifesp_2024_gabarito()
    b_qs = extract_unifesp_2024_booklet()
    b_tokens = {qn: get_tokens(txt) for qn, txt in b_qs.items()}

    print(f"Gabarito Oficial Definitivo carregado: {len(ans_map)} questões")
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
    matched_qns = set()

    for sf, qs in db_questions_by_file.items():
        file_resolved = 0
        for q in qs:
            inst = q.get('institution') or ''
            if 'UNIFESP' in inst and q.get('year') == 2024:
                st = q.get('statement') or ''
                q_toks = get_tokens(st)

                best_qn = None
                best_score = 0
                for qn, b_tok in b_tokens.items():
                    inter = len(q_toks & b_tok)
                    if inter > best_score:
                        best_score = inter
                        best_qn = qn

                # Limiar estrito de overlap: pelo menos 10 tokens coincidentes
                if best_qn and best_score >= 10:
                    official_ans = ans_map.get(best_qn)
                    if official_ans:
                        q['correct_answer'] = official_ans
                        q['homologated_exam'] = True
                        q['official_exam_meta'] = {
                            'institution': 'UNIFESP',
                            'year': 2024,
                            'exam': 'ACESSO DIRETO',
                            'question_number': best_qn,
                            'overlap_score': best_score,
                            'source': 'FAPUNIFESP/UNIFESP Oficial Definitivo'
                        }
                        file_resolved += 1
                        matched_qns.add(best_qn)
        
        if file_resolved > 0:
            print(f"[{sf}] Homologadas com sucesso: {file_resolved} questões")
            total_resolved += file_resolved
            with open(sf, 'w', encoding='utf-8') as fp:
                json.dump(qs, fp, ensure_ascii=False, indent=2)

    print("="*80)
    print(f"TOTAL HOMOLOGADO UNIFESP 2024: {total_resolved} questões em banco")
    print(f"Questões do caderno cobertas: {len(matched_qns)} / {len(b_qs)}")
    print("="*80)

if __name__ == '__main__':
    run()
