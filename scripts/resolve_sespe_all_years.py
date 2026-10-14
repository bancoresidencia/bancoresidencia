import os, sys, json, re, unicodedata, pypdf
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

def extract_booklet_questions(pdf_path):
    reader = pypdf.PdfReader(pdf_path)
    full_text = '\n'.join([p.extract_text() or '' for p in reader.pages])
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

def run_sespe_resolution():
    print("="*80)
    print("RESOLVENDO 100% DOS GABARITOS OFICIAIS SES-PE (2015 A 2024)")
    print("="*80)

    iaupe_ext = IAUPEExtractor()

    # Mapeamento de arquivos por ano
    years_files = {}
    # 2024
    years_files[2024] = {
        'prova': 'data/official_exams/SES_PE/SES_PE_2024_GR_01_-__REAS_B_SICAS_COM_ACESSO_DIRETO__2024.pdf',
        'gabarito': 'data/official_exams/SES_PE/SES_PE_2024_GABARITO_DEFINITIVO_ACESSO_DIRETO_2024_Repub.pdf'
    }
    # 2015 a 2023
    for yr in range(2015, 2024):
        years_files[yr] = {
            'prova': f'data/official_exams/SES_PE/SES_PE_{yr}_PROVA_ACESSO_DIRETO.pdf',
            'gabarito': f'data/official_exams/SES_PE/SES_PE_{yr}_GABARITO_ACESSO_DIRETO.pdf'
        }

    # Carrega banco de questões
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

    total_updated = 0

    for yr in sorted(years_files.keys(), reverse=True):
        finfo = years_files[yr]
        pv_path, gb_path = finfo['prova'], finfo['gabarito']
        if not (os.path.exists(pv_path) and os.path.exists(gb_path)):
            print(f"[SES-PE {yr}] Arquivo não encontrado: {pv_path} ou {gb_path}")
            continue

        gb_res = iaupe_ext.extract(gb_path)
        if not gb_res:
            print(f"[SES-PE {yr}] Falha ao extrair gabarito")
            continue
        
        ans_map = {q.numero_questao: q.alternativa for q in gb_res[0].questoes}
        status_map = {q.numero_questao: q.status for q in gb_res[0].questoes}
        b_qs = extract_booklet_questions(pv_path)
        booklet_tokens = {qn: get_tokens(txt) for qn, txt in b_qs.items()}

        print(f"\n[SES-PE {yr}] Caderno com {len(b_qs)}q | Gabarito Definitivo com {len(ans_map)} respostas")

        yr_updated = 0
        for sf, qs in db_questions_by_file.items():
            for q in qs:
                if q.get('institution') == 'SES-PE - Secretaria de Estado de Saúde de Pernambuco' and q.get('year') == yr:
                    has_ans = bool((q.get('correct_answer') or '').strip() or q.get('is_anulada'))
                    st = q.get('statement') or ''
                    q_toks = get_tokens(st)

                    # Tenta matching ordinal se estiver explícito no código ou número
                    code = str(q.get('code') or '')
                    ord_match = re.search(r'Q(?:uest[aã]o)?[-_ ]?(\d+)', code, re.I)
                    cand_qn = int(ord_match.group(1)) if ord_match and int(ord_match.group(1)) <= 100 else None

                    best_qn = None
                    best_score = 0

                    # 1. Se tem cand_qn, verifica se os tokens batem
                    if cand_qn and cand_qn in booklet_tokens:
                        common = len(q_toks & booklet_tokens[cand_qn])
                        if common >= 3 or norm(st)[:40] in norm(b_qs[cand_qn]):
                            best_qn = cand_qn
                            best_score = 999

                    # 2. Token overlap search
                    if best_qn is None and len(q_toks) >= 3:
                        for qn, b_toks in booklet_tokens.items():
                            inter = len(q_toks & b_toks)
                            if inter > best_score:
                                best_score = inter
                                best_qn = qn

                    # 3. Substring check
                    if (best_qn is None or best_score < 4) and len(st) > 20:
                        st_norm = norm(st)[:60]
                        for qn, b_txt in b_qs.items():
                            if st_norm and st_norm in norm(b_txt):
                                best_qn = qn
                                best_score = 999
                                break

                    if best_qn and (best_score >= 4 or best_score >= 999):
                        ans_oficial = ans_map.get(best_qn)
                        st_oficial = status_map.get(best_qn)
                        if ans_oficial:
                            curr_ans = (q.get('correct_answer') or '').strip()
                            is_anul = (ans_oficial == 'ANULADA' or st_oficial == 'anulada')
                            final_ans = 'ANULADA' if is_anul else ans_oficial

                            # Se estava sem gabarito ou precisava de correção para o oficial definitivo
                            if not curr_ans or curr_ans != final_ans:
                                q['correct_answer'] = final_ans
                                q['correctAnswer'] = final_ans
                                q['is_anulada'] = is_anul
                                q['isAnulada'] = is_anul
                                q['official_source'] = f"Gabarito Oficial Definitivo IAUPE SES-PE {yr} Questão {best_qn}"
                                q['official_audit'] = {
                                    'verified': True,
                                    'institution': 'SES-PE',
                                    'year': yr,
                                    'question_number': best_qn,
                                    'official_answer': final_ans,
                                    'score': best_score
                                }
                                yr_updated += 1
                                total_updated += 1

        print(f"  -> Questões resolvidas/homologadas em {yr}: {yr_updated}")

    # Salva arquivos
    if total_updated > 0:
        print("\nSalvando arquivos atualizados...")
        for sf, qs in db_questions_by_file.items():
            with open(sf, 'w', encoding='utf-8') as fp:
                json.dump(qs, fp, ensure_ascii=False, indent=2)
            print(f"Gravado: {sf}")

    print(f"\nTOTAL DE QUESTÕES HOMOLOGADAS OFICIALMENTE SES-PE: {total_updated}")
    print("="*80)

if __name__ == '__main__':
    run_sespe_resolution()
