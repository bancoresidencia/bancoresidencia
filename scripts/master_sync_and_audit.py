import os
import sys
import re
import json
import time
import sqlite3
import unicodedata
from datetime import datetime
from collections import defaultdict

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import pymupdf

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_DIR = os.path.join(BASE_DIR, 'data')
OFFICIAL_DIR = os.path.join(DATA_DIR, 'official_exams')
DB_PATH = os.path.join(DATA_DIR, 'provaderesidencia_coleta.db')

QUESTION_FILES = [
    ('Urologia', os.path.join(DATA_DIR, 'urologia_final_questions.json')),
    ('Ginecologia', os.path.join(DATA_DIR, 'ginecologia_final_questions.json')),
    ('Obstetrícia', os.path.join(DATA_DIR, 'obstetricia_final_questions.json')),
    ('Cirurgia Geral', os.path.join(DATA_DIR, 'cirurgia_final_questions.json')),
    ('Pediatria', os.path.join(DATA_DIR, 'pediatria_final_questions.json')),
    ('Medicina Preventiva', os.path.join(DATA_DIR, 'medicina_preventiva_final_questions.json')),
    ('Clínica Médica', os.path.join(DATA_DIR, 'clinica_medica_final_questions.json'))
]

def log(msg):
    ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{ts}] {msg}", flush=True)

def norm_hash(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()[:85]

def clean_stmt(text):
    if not text:
        return ''
    text = re.sub(r'^(?:QUEST(?:ÃO|O|AO)|Quest(?:ão|ao))\s*\d{1,3}[.:\s-]*', '', text, flags=re.I)
    text = re.sub(r'^\d{1,3}\s*[\.-]\s*', '', text)
    alt_match = re.search(r'(?:\n|\r\n|\s{2,})\([A-E]\)\s+', text)
    if alt_match:
        text = text[:alt_match.start()]
    return text.strip()

def parse_gab(fp):
    try:
        doc = pymupdf.open(fp)
    except Exception:
        return {}
    txt = '\n'.join([p.get_text() for p in doc])
    answers = {}
    p1 = re.findall(r'(?:^|[\s\t,;|(])(?:Q(?:uest[aã]o)?\s*)?(\d{1,3})\s*[-–.)\t :]{1,4}\s*([A-E]|ANULADA|NULA|CANCELADA|X|\*)\b', txt, re.I | re.M)
    for qn, ans in p1:
        q_int = int(qn)
        if 1 <= q_int <= 120 and q_int not in answers:
            ans_clean = ans.upper()
            answers[q_int] = 'ANULADA' if ans_clean in ['X', '*', 'NULA', 'CANCELADA', 'ANULADA'] else ans_clean

    if len(answers) < 20:
        lines = [l.strip() for l in txt.split('\n') if l.strip()]
        for i in range(len(lines) - 1):
            nums = re.findall(r'\b\d{1,3}\b', lines[i])
            if len(nums) >= 5:
                letters = re.findall(r'\b([A-E]|X|\*|ANULADA)\b', lines[i+1], re.I)
                if len(nums) == len(letters):
                    for n, l in zip(nums, letters):
                        qn = int(n)
                        if 1 <= qn <= 120:
                            answers[qn] = 'ANULADA' if l.upper() in ['X', '*', 'ANULADA'] else l.upper()
    return answers

def extract_qs(fp):
    try:
        doc = pymupdf.open(fp)
    except Exception:
        return {}
    full_text = '\n'.join([p.get_text() for p in doc])
    strategies = [
        r'(?:^|\n)\s*(?:QUEST[AÃÃOo\s]+|Quest[aão\s]+)\s*(\d{1,3})[.:\s-]',
        r'(?:^|\n)\s*(\d{1,3})\s*[\.-]\s+',
        r'(?:^|\n)\s*(\d{1,3})\s*(?:\n|\r\n)(?=[A-Z\u00C0-\u00DC])',
    ]
    for pat in strategies:
        matches = list(re.finditer(pat, full_text))
        valid = []
        for m in matches:
            try:
                qn = int(m.group(1))
                if 1 <= qn <= 120:
                    valid.append((qn, m.start(), m.end()))
            except:
                pass
        if len(valid) >= 15:
            valid_sorted = sorted(valid, key=lambda x: x[1])
            dedup = []
            seen_q = set()
            for qn, s, e in valid_sorted:
                if qn not in seen_q:
                    seen_q.add(qn)
                    dedup.append((qn, s, e))
            if len(dedup) >= 15:
                qs = {}
                for i in range(len(dedup)):
                    qn, s, e = dedup[i]
                    next_s = dedup[i+1][1] if i + 1 < len(dedup) else len(full_text)
                    body = full_text[e:next_s].strip()
                    if len(body) >= 30:
                        qs[qn] = body
                if len(qs) >= 15:
                    return qs
    return {}

def main():
    log("="*80)
    log("PIPELINE MESTRE: INTEGRAÇÃO COMPLETA DE GABARITOS OFICIAIS (OPÇÃO A + B)")
    log("="*80)

    # 1. Carrega todos os matches do SQLite
    log("📦 [1/4] Carregando correspondências oficiais do banco SQLite...")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    all_matches_by_id = {}

    # drive_matches
    for qid, esp, gab, pdf_name in c.execute("SELECT questao_banco_id, especialidade, gabarito, pdf_name FROM drive_matches WHERE questao_banco_id IS NOT NULL"):
        if gab and gab.strip():
            all_matches_by_id[qid] = {'gab': gab.strip().upper(), 'source': f"Drive PDF {pdf_name}"}

    # matches_banco
    for qid, esp, gab, inst, ano in c.execute("SELECT questao_banco_id, especialidade, gabarito, instituicao, ano FROM matches_banco WHERE questao_banco_id IS NOT NULL"):
        if gab and gab.strip() and qid not in all_matches_by_id:
            all_matches_by_id[qid] = {'gab': gab.strip().upper(), 'source': f"Provaderesidencia {inst} {ano}"}

    log(f"   • Total de questões homologadas mapeadas por ID: {len(all_matches_by_id):,}")

    # 2. Descobre pares de cadernos e gabaritos em data/official_exams
    log("\n📄 [2/4] Extraindo cadernos de provas oficiais (Opção A: data/official_exams)...")
    official_hash_matches = {}

    pairs = []
    for root, dirs, files in os.walk(OFFICIAL_DIR):
        for f in sorted(files):
            if not f.endswith('.pdf'):
                continue
            if any(k in f.lower() for k in ['gb', 'gabarito', 'respostas', 'chave', 'alteracao', 'retificacao']):
                continue

            banca = os.path.relpath(root, OFFICIAL_DIR).split(os.sep)[0]
            base_name = f[:-4]
            candidate_names = [
                base_name.replace('-prova', '-gabarito') + '.pdf',
                base_name.replace('_prova', '_gabarito') + '.pdf',
                base_name.replace('_PROVA', '_GABARITO') + '.pdf',
                base_name.replace('_PV', '_GB') + '.pdf',
                base_name.replace('_PV', '_GB_DEF') + '.pdf',
                base_name.replace('_PV', '_GB_PREL') + '.pdf',
                base_name.replace('_PV_AD', '_GB_DEF') + '.pdf',
                base_name.replace('_PV_AD', '_GB_PREL') + '.pdf',
                base_name.replace('_PV_AD', '_GB_AD') + '.pdf',
                base_name.replace('_PV_AD', '_GB_DEF_AD') + '.pdf',
                base_name.replace('_PV_AD', '_GB_PREL_AD') + '.pdf',
            ]
            found_gb = None
            for cand in candidate_names:
                if cand == f:
                    continue
                cp = os.path.join(root, cand)
                if os.path.exists(cp):
                    found_gb = cp
                    break
                b_root = os.path.join(OFFICIAL_DIR, banca)
                cp = os.path.join(b_root, cand)
                if os.path.exists(cp):
                    found_gb = cp
                    break
                cp = os.path.join(b_root, 'USP_2021_GABARITOS', cand)
                if os.path.exists(cp):
                    found_gb = cp
                    break

            if found_gb:
                pairs.append({
                    'banca': banca,
                    'type': 'pdf',
                    'booklet_path': os.path.join(root, f),
                    'booklet_name': f,
                    'gabarito_path': found_gb,
                    'gabarito_name': os.path.basename(found_gb)
                })

    for y in [2024, 2025]:
        for t in ['A', 'B']:
            pv = os.path.join(OFFICIAL_DIR, 'SES_DF', f'SES_DF_{y}_PV_TIPO_{t}.pdf')
            gj = os.path.join(OFFICIAL_DIR, 'SES_DF', f'ses_df_{y}_gabarito.json')
            if os.path.exists(pv) and os.path.exists(gj):
                pairs.append({
                    'banca': 'SES_DF',
                    'type': 'json',
                    'booklet_path': pv,
                    'booklet_name': f'SES_DF_{y}_PV_TIPO_{t}.pdf',
                    'gabarito_path': gj,
                    'gabarito_name': f'ses_df_{y}_gabarito.json (tipo_{t.lower()})',
                    'json_tipo': f'tipo_{t.lower()}'
                })

    log(f"   • Total de pares estritos identificados em official_exams: {len(pairs)}")

    for p in pairs:
        banca = p['banca']
        b_name = p['booklet_name']
        g_name = p['gabarito_name']

        if p['type'] == 'pdf':
            g_dict = parse_gab(p['gabarito_path'])
        else:
            try:
                with open(p['gabarito_path'], 'r', encoding='utf-8') as jf:
                    g_dict_raw = json.load(jf).get(p['json_tipo'], {})
                    g_dict = {int(k): v.upper() for k, v in g_dict_raw.items()}
            except Exception:
                g_dict = {}

        if not g_dict:
            continue

        qs = extract_qs(p['booklet_path'])
        if not qs:
            continue

        for qn, raw_txt in qs.items():
            ans = g_dict.get(qn)
            if not ans:
                continue

            c_txt = clean_stmt(raw_txt)
            h1 = norm_hash(c_txt)
            h2 = norm_hash(raw_txt)

            for h in [h1, h2]:
                if len(h) >= 20 and h not in official_hash_matches:
                    official_hash_matches[h] = {
                        'gab': ans,
                        'source': f"Official Exam {banca} {b_name} Q{qn}",
                        'audit': {
                            'verified': True,
                            'source': 'official_exams',
                            'banca': banca,
                            'booklet': b_name,
                            'gabarito': g_name,
                            'question_number': qn,
                            'official_answer': ans,
                            'timestamp': datetime.now().isoformat()
                        }
                    }

    log(f"   • Enunciados com gabarito oficial extraídos de official_exams: {len(official_hash_matches):,}")

    # 3. Processamento sequencial de cada arquivo de especialidade
    log("\n🔄 [3/4] Atualizando e salvando arquivos de especialidades com segurança...")
    stats = {}

    for esp, fpath in QUESTION_FILES:
        if not os.path.exists(fpath):
            continue

        t0 = time.time()
        with open(fpath, 'r', encoding='utf-8') as f:
            questions = json.load(f)

        before_ans = sum(1 for q in questions if (q.get('correctAnswer') or q.get('correct_answer') or q.get('isAnulada') or q.get('is_anulada')))
        applied_id = 0
        applied_hash = 0

        for q in questions:
            cur_ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip()
            cur_anul = bool(q.get('isAnulada') or q.get('is_anulada'))

            if cur_ans or cur_anul:
                continue

            qid = q.get('id')

            # Tentativa 1: ID direto mapeado do SQLite
            if qid and qid in all_matches_by_id:
                m = all_matches_by_id[qid]
                gab = m['gab']
                if gab in ['!', 'X', 'ANULADA', '*', '#']:
                    q['isAnulada'] = True
                    q['is_anulada'] = True
                    q['correctAnswer'] = 'ANULADA'
                    q['correct_answer'] = 'ANULADA'
                else:
                    q['correctAnswer'] = gab
                    q['correct_answer'] = gab
                    q['isAnulada'] = False
                    q['is_anulada'] = False

                q['official_source'] = m['source']
                applied_id += 1
                continue

            # Tentativa 2: Hash do enunciado dos exames oficiais (Opção A)
            stmt = q.get('statement') or q.get('enunciado') or ''
            h = norm_hash(stmt)
            if h in official_hash_matches:
                m = official_hash_matches[h]
                ans = m['gab']
                if ans in ['ANULADA', 'X', '*', '#']:
                    q['isAnulada'] = True
                    q['is_anulada'] = True
                    q['correctAnswer'] = 'ANULADA'
                    q['correct_answer'] = 'ANULADA'
                else:
                    q['correctAnswer'] = ans
                    q['correct_answer'] = ans
                    q['isAnulada'] = False
                    q['is_anulada'] = False

                q['official_source'] = m['source']
                q['official_audit'] = m['audit']
                applied_hash += 1

        total_applied_esp = applied_id + applied_hash

        # Grava de volta se houve alterações
        if total_applied_esp > 0:
            with open(fpath, 'w', encoding='utf-8') as f:
                json.dump(questions, f, ensure_ascii=False, indent=2)

        # Verificação imediata no disco
        with open(fpath, 'r', encoding='utf-8') as f:
            verified_data = json.load(f)

        after_ans = sum(1 for q in verified_data if (q.get('correctAnswer') or q.get('correct_answer') or q.get('isAnulada') or q.get('is_anulada')))
        tot = len(verified_data)
        pct = (after_ans / tot * 100) if tot > 0 else 0

        stats[esp] = {
            'total': tot,
            'before': before_ans,
            'applied': total_applied_esp,
            'after': after_ans,
            'missing': tot - after_ans,
            'pct': pct
        }

        log(f"   ✅ {esp:<22}: {after_ans:>6,} / {tot:>6,} ({pct:>5.1f}%) | +{total_applied_esp:,} novos ({time.time()-t0:.1f}s)")

    # 4. Apresentação do Censo e Auditoria Final
    log("\n📊 [4/4] CENSO FINAL DE HOMOLOGAÇÃO DO BANCO")
    print("\n" + "="*85)
    print(f"| {'Especialidade':<22} | {'Total':^8} | {'Com Gabarito':^14} | {'Sem Gabarito':^14} | {'% Cobertura':^12} |")
    print("|" + "-"*24 + "|" + "-"*10 + "|" + "-"*16 + "|" + "-"*16 + "|" + "-"*14 + "|")

    g_tot = 0
    g_ans = 0
    g_mis = 0

    for esp, s in stats.items():
        print(f"| {esp:<22} | {s['total']:>8,} | {s['after']:>14,} | {s['missing']:>14,} | {s['pct']:>11.2f}% |")
        g_tot += s['total']
        g_ans += s['after']
        g_mis += s['missing']

    g_pct = (g_ans / g_tot * 100) if g_tot > 0 else 0
    print("|" + "="*24 + "|" + "="*10 + "|" + "="*16 + "|" + "="*16 + "|" + "="*14 + "|")
    print(f"| {'TOTAL GERAL':<22} | {g_tot:>8,} | {g_ans:>14,} | {g_mis:>14,} | {g_pct:>11.2f}% |")
    print("="*85 + "\n")

if __name__ == '__main__':
    main()
