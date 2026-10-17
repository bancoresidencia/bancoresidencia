import os
import sys
import re
import json
import time
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
LOG_FILE = os.path.join(DATA_DIR, 'official_exams_processing.log')

QUESTION_FILES = {
    'urologia': os.path.join(DATA_DIR, 'urologia_final_questions.json'),
    'ginecologia': os.path.join(DATA_DIR, 'ginecologia_final_questions.json'),
    'obstetricia': os.path.join(DATA_DIR, 'obstetricia_final_questions.json'),
    'cirurgia': os.path.join(DATA_DIR, 'cirurgia_final_questions.json'),
    'pediatria': os.path.join(DATA_DIR, 'pediatria_final_questions.json'),
    'medicina_preventiva': os.path.join(DATA_DIR, 'medicina_preventiva_final_questions.json'),
    'clinica_medica': os.path.join(DATA_DIR, 'clinica_medica_final_questions.json')
}

def log(msg):
    ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(line + '\n')
    except:
        pass

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

class OfficialStrictMatcher:
    def __init__(self):
        self.user_questions = {}
        self.missing_index = defaultdict(list)
        self.total_loaded = 0
        self.total_missing = 0
        self.dirty_specialties = set()
        self.matches_applied = 0
        self.matches_by_esp = {k: 0 for k in QUESTION_FILES.keys()}
        self.pairs = []

    def load_bank(self):
        log("📚 Carregando banco de questões do usuário...")
        for esp, fpath in QUESTION_FILES.items():
            if not os.path.exists(fpath):
                continue
            with open(fpath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self.user_questions[esp] = data
            self.total_loaded += len(data)
            for idx, q in enumerate(data):
                ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip()
                is_anul = bool(q.get('isAnulada') or q.get('is_anulada'))
                if not ans and not is_anul:
                    self.total_missing += 1
                    stmt = q.get('statement') or q.get('enunciado') or ''
                    h = norm_hash(stmt)
                    if len(h) >= 20:
                        self.missing_index[h].append((esp, idx, q))

        log(f"   • Total carregado: {self.total_loaded:,} questões")
        log(f"   • Pendentes de gabarito: {self.total_missing:,} questões")
        log(f"   • Hashes únicos pendentes: {len(self.missing_index):,}")

    def discover_strict_pairs(self):
        log("\n🔗 Descobrindo pares estritos de caderno e gabarito oficial...")
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
                    self.pairs.append({
                        'banca': banca,
                        'type': 'pdf',
                        'booklet_path': os.path.join(root, f),
                        'booklet_name': f,
                        'gabarito_path': found_gb,
                        'gabarito_name': os.path.basename(found_gb)
                    })

        # Adiciona também os pares JSON de SES_DF
        for y in [2024, 2025]:
            for t in ['A', 'B']:
                pv = os.path.join(OFFICIAL_DIR, 'SES_DF', f'SES_DF_{y}_PV_TIPO_{t}.pdf')
                gj = os.path.join(OFFICIAL_DIR, 'SES_DF', f'ses_df_{y}_gabarito.json')
                if os.path.exists(pv) and os.path.exists(gj):
                    self.pairs.append({
                        'banca': 'SES_DF',
                        'type': 'json',
                        'booklet_path': pv,
                        'booklet_name': f'SES_DF_{y}_PV_TIPO_{t}.pdf',
                        'gabarito_path': gj,
                        'gabarito_name': f'ses_df_{y}_gabarito.json (tipo_{t.lower()})',
                        'json_tipo': f'tipo_{t.lower()}'
                    })

        log(f"   • Total de pares estritos identificados: {len(self.pairs)}")

    def run_matching(self):
        log("\n🚀 Executando pareamento e aplicação no banco...")
        for p in self.pairs:
            banca = p['banca']
            b_name = p['booklet_name']
            g_name = p['gabarito_name']

            # Parse gabarito
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

            hits_in_pair = 0
            for qn, raw_txt in qs.items():
                ans = g_dict.get(qn)
                if not ans:
                    continue

                c_txt = clean_stmt(raw_txt)
                h1 = norm_hash(c_txt)
                h2 = norm_hash(raw_txt)

                target_h = h1 if h1 in self.missing_index else (h2 if h2 in self.missing_index else None)
                if target_h:
                    candidates = self.missing_index[target_h]
                    applied = False
                    for esp, idx, q in candidates:
                        cur_ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip()
                        cur_anul = bool(q.get('isAnulada') or q.get('is_anulada'))
                        if not cur_ans and not cur_anul:
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

                            q['questionNumber'] = qn
                            q['official_source'] = f"Official Exam {banca} {b_name} Q{qn}"
                            q['official_audit'] = {
                                'verified': True,
                                'source': 'official_exams',
                                'banca': banca,
                                'booklet': b_name,
                                'gabarito': g_name,
                                'question_number': qn,
                                'official_answer': ans,
                                'timestamp': datetime.now().isoformat()
                            }

                            self.dirty_specialties.add(esp)
                            self.matches_applied += 1
                            self.matches_by_esp[esp] += 1
                            hits_in_pair += 1
                            applied = True

                    if applied:
                        del self.missing_index[target_h]

            if hits_in_pair > 0:
                log(f"   🎯 [{banca:12}] {b_name[:35]:35} -> +{hits_in_pair:2d} novas homologações")

        log(f"\nTotal de novas questões oficiais homologadas: +{self.matches_applied:,}")

    def safe_flush(self):
        if not self.dirty_specialties:
            log("Nenhuma alteração a salvar.")
            return

        log("\n💾 Gravando alterações nos arquivos JSON com segurança...")
        for esp in sorted(self.dirty_specialties):
            fpath = QUESTION_FILES.get(esp)
            if not fpath or esp not in self.user_questions:
                continue

            saved = False
            for attempt in range(1, 4):
                try:
                    with open(fpath, 'w', encoding='utf-8') as f:
                        json.dump(self.user_questions[esp], f, ensure_ascii=False, indent=2)
                    log(f"   ✅ {esp.replace('_', ' ').title():<25}: +{self.matches_by_esp[esp]:,} gabaritos homologados e salvos!")
                    saved = True
                    break
                except Exception as e:
                    log(f"   ⚠️ Tentativa {attempt} falhou ao salvar {esp}: {e}")
                    time.sleep(1)

            if not saved:
                log(f"   ❌ ERRO CRÍTICO ao salvar {esp}!")

        self.dirty_specialties.clear()

def main():
    log("="*80)
    log("INICIANDO HOMOLOGAÇÃO OFICIAL STRICT COUNTERPART (OPÇÃO A)")
    log("="*80)

    matcher = OfficialStrictMatcher()
    matcher.load_bank()
    matcher.discover_strict_pairs()
    matcher.run_matching()
    matcher.safe_flush()

    log("="*80)
    log(f"FINALIZADO COM SUCESSO! TOTAL: +{matcher.matches_applied:,} NOVAS QUESTÕES COM GABARITO")
    log("="*80)

if __name__ == '__main__':
    main()
