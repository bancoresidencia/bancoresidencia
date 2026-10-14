import os, sys, json, re, unicodedata, hashlib, sqlite3
sys.path.insert(0, os.path.abspath('.'))

import pypdf
from collections import defaultdict
from coletor_gabaritos.extractors.iaupe_extractor import IAUPEExtractor
from coletor_gabaritos.extractors.amrigs_extractor import AMRIGSExtractor
from coletor_gabaritos.extractors.usp_extractor import USPExtractor
from coletor_gabaritos.extractors.vunesp_extractor import VUNESPExtractor
from coletor_gabaritos.extractors.generic_tabular_extractor import GenericTabularExtractor
from coletor_gabaritos.validator.validator import GabaritoValidator

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("="*80)
print("INICIALIZANDO FASE 2: INGESTÃO E RESOLUÇÃO LOCAL - LOTE 1")
print("="*80)

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
        if 1 <= qn <= 120 and qn not in questions:
            s_idx = m.start()
            e_idx = matches[i+1].start() if i+1 < len(matches) else len(full_text)
            questions[qn] = full_text[s_idx:e_idx]
    return questions

# 1. Carrega todas as questões do banco para memória
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
        print(f"Carregado: {sf} com {len(db_questions_by_file[sf])} questões")

conn = sqlite3.connect('data/gabaritos_nacional.db')
c = conn.cursor()

validator = GabaritoValidator()
iaupe_ext = IAUPEExtractor()
amrigs_ext = AMRIGSExtractor()
usp_ext = USPExtractor()

total_resolved_batch = 0

# --- Processa SES-PE ---
print("\n--- Processando SES-PE (2024, 2025, 2026) ---")
sespe_configs = [
    (2025, 'data/official_exams/SES_PE/SES_PE_2025_GR_01_ACESSO.pdf', 'data/official_exams/SES_PE/SES_PE_2025_GABARITO_DEFINITIVO_ACESSO_DIRETO_2025.pdf'),
    (2026, 'data/official_exams/SES_PE/SES_PE_2026_GR_01_ACESSO.pdf', 'data/official_exams/SES_PE/SES_PE_2026_GABARITO_DEFINITIVO_ACESSO_DIRETO_2026.pdf')
]

for yr, cd_path, gb_path in sespe_configs:
    if not (os.path.exists(cd_path) and os.path.exists(gb_path)):
        continue
    
    gb_res = iaupe_ext.extract(gb_path)[0]
    ans_map = {q.numero_questao: q.alternativa for q in gb_res.questoes}
    status_map = {q.numero_questao: q.status for q in gb_res.questoes}
    b_qs = extract_booklet_questions(cd_path)
    booklet_tokens = {qn: get_tokens(txt) for qn, txt in b_qs.items()}

    print(f"SES-PE {yr}: Caderno com {len(b_qs)}q | Gabarito Definitivo com {len(ans_map)} respostas")

    # Match contra todas as especialidades
    resolved_in_year = 0
    for sf, qs in db_questions_by_file.items():
        for q in qs:
            if q.get('institution') == 'SES-PE - Secretaria de Estado de Saúde de Pernambuco' and q.get('year') == yr:
                st = q.get('statement') or ''
                q_toks = get_tokens(st)
                if len(q_toks) < 3: continue

                # Match por tokens
                best_qn = None
                best_score = 0
                for qn, b_toks in booklet_tokens.items():
                    inter = len(q_toks & b_toks)
                    if inter > best_score:
                        best_score = inter
                        best_qn = qn

                # Verbatim check
                st_norm = norm(st)[:60]
                if best_qn is None or best_score < 4:
                    for qn, b_txt in b_qs.items():
                        if st_norm and st_norm in norm(b_txt):
                            best_qn = qn
                            best_score = 99
                            break

                if best_qn and (best_score >= 4 or best_score == 99):
                    ans_oficial = ans_map.get(best_qn)
                    st_oficial = status_map.get(best_qn)
                    if ans_oficial:
                        curr_ans = (q.get('correct_answer') or '').strip()
                        if not curr_ans or curr_ans != ans_oficial:
                            q['correct_answer'] = 'ANULADA' if ans_oficial == 'ANULADA' or st_oficial == 'anulada' else ans_oficial
                            q['is_anulada'] = True if q['correct_answer'] == 'ANULADA' else False
                            q['official_source'] = f"Gabarito Definitivo SES-PE {yr} Questão {best_qn}"
                            resolved_in_year += 1
                            total_resolved_batch += 1

    print(f"  -> Questões resolvidas/atualizadas com gabarito oficial em SES-PE {yr}: {resolved_in_year}")

# --- Processa AMRIGS ---
print("\n--- Processando AMRIGS ---")
amrigs_gb = 'data/official_exams/AMRIGS/AMRIGS_Gabarito_Definitivo_Acesso_Direto.pdf'
if os.path.exists(amrigs_gb):
    gb_res = amrigs_ext.extract(amrigs_gb)[0]
    ans_map = {q.numero_questao: q.alternativa for q in gb_res.questoes}
    print(f"AMRIGS Definitivo: {len(ans_map)} respostas extraídas")

# --- Processa USP FUVEST ---
print("\n--- Processando USP / FUVEST ---")
for yr in [2023, 2024, 2025]:
    usp_gb = f'data/official_exams/USP_FUVEST/USP_FUVEST_{yr}_GB.pdf'
    usp_pv = f'data/official_exams/USP_FUVEST/USP_FUVEST_{yr}_PV.pdf'
    if os.path.exists(usp_gb) and os.path.exists(usp_pv):
        res_list = usp_ext.extract(usp_gb)
        if res_list:
            ans_map = {q.numero_questao: q.alternativa for q in res_list[0].questoes}
            b_qs = extract_booklet_questions(usp_pv)
            booklet_tokens = {qn: get_tokens(txt) for qn, txt in b_qs.items()}
            print(f"USP {yr}: Caderno {len(b_qs)}q | Gabarito {len(ans_map)} respostas")

            resolved_usp = 0
            for sf, qs in db_questions_by_file.items():
                for q in qs:
                    if 'USP' in (q.get('institution') or '') and q.get('year') == yr:
                        st = q.get('statement') or ''
                        q_toks = get_tokens(st)
                        if len(q_toks) < 3: continue

                        best_qn = None
                        best_score = 0
                        for qn, b_toks in booklet_tokens.items():
                            inter = len(q_toks & b_toks)
                            if inter > best_score:
                                best_score = inter
                                best_qn = qn

                        if best_qn and best_score >= 4:
                            ans_oficial = ans_map.get(best_qn)
                            if ans_oficial:
                                curr_ans = (q.get('correct_answer') or '').strip()
                                if not curr_ans or curr_ans != ans_oficial:
                                    q['correct_answer'] = 'ANULADA' if ans_oficial == 'ANULADA' else ans_oficial
                                    q['is_anulada'] = True if q['correct_answer'] == 'ANULADA' else False
                                    q['official_source'] = f"Gabarito Oficial USP {yr} Questão {best_qn}"
                                    resolved_usp += 1
                                    total_resolved_batch += 1

            print(f"  -> Questões resolvidas/atualizadas com gabarito oficial em USP {yr}: {resolved_usp}")

# Grava atualizações atômicas nos JSONs das especialidades
print("\n--- Gravando dados homologados nos arquivos do banco ---")
for sf, qs in db_questions_by_file.items():
    with open(sf, 'w', encoding='utf-8') as fp:
        json.dump(qs, fp, ensure_ascii=False, indent=2)
    print(f"Atualizado com sucesso: {sf}")

print(f"\nTotal de questões homologadas e sincronizadas nesta etapa: {total_resolved_batch}")
print("="*80)
