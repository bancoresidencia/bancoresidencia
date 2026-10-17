import os
import sys
import re
import json
import time
import unicodedata
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
import pypdf
import pdfplumber

# Configuração de caminhos
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MASSIVO_DIR = os.path.join(BASE_DIR, 'docs', 'massivobanco')
STATUS_FILE = os.path.join(DATA_DIR, 'pdf_massivobanco_status.json')
LOG_FILE = os.path.join(DATA_DIR, 'pdf_massivobanco.log')
DB_PATH = os.path.join(DATA_DIR, 'provaderesidencia_coleta.db')

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
    formatted = f"[{ts}] {msg}"
    print(formatted)
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(formatted + '\n')
    except:
        pass

def norm_hash(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()[:85]

class MassivoBankMatcher:
    def __init__(self):
        self.user_questions = {}
        self.missing_index = {}       # {norm_hash: [(esp, idx, q)]}
        self.all_index = {}           # {norm_hash: [(esp, idx, q)]}
        self.total_loaded = 0
        self.total_missing = 0
        self.dirty_specialties = set()
        self.matches_applied = 0
        self.matches_by_esp = {k: 0 for k in QUESTION_FILES.keys()}
        self._load_bank()

    def _load_bank(self):
        log("📚 Carregando e indexando banco de questões do usuário...")
        for esp, fpath in QUESTION_FILES.items():
            if not os.path.exists(fpath):
                continue
            try:
                with open(fpath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                self.user_questions[esp] = data
                self.total_loaded += len(data)
                for idx, q in enumerate(data):
                    ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip()
                    is_anulada = bool(q.get('isAnulada') or q.get('is_anulada'))
                    stmt = q.get('statement') or q.get('enunciado') or ''
                    h = norm_hash(stmt)
                    if len(h) >= 20:
                        if h not in self.all_index:
                            self.all_index[h] = []
                        self.all_index[h].append((esp, idx, q))

                        if not ans and not is_anulada:
                            self.total_missing += 1
                            if h not in self.missing_index:
                                self.missing_index[h] = []
                            self.missing_index[h].append((esp, idx, q))
            except Exception as e:
                log(f"Erro ao carregar {esp}: {e}")

        log(f"   • Total de questões indexadas: {self.total_loaded:,}")
        log(f"   • Pendentes de gabarito: {self.total_missing:,}")
        log(f"   • Chaves hash únicas indexadas: {len(self.all_index):,}")

    def apply_match(self, stmt, gabarito_letra, is_anulada, pdf_meta, q_num):
        h = norm_hash(stmt)
        if not h or h not in self.missing_index:
            return False

        matched = False
        candidates = self.missing_index[h]
        for esp, idx, q in candidates:
            current_ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip()
            current_anulada = bool(q.get('isAnulada') or q.get('is_anulada'))
            if not current_ans and not current_anulada:
                # Aplica gabarito oficial com segurança
                if is_anulada or gabarito_letra in ['X', 'ANULADA', '*', '#']:
                    q['isAnulada'] = True
                    q['is_anulada'] = True
                    q['correctAnswer'] = 'ANULADA'
                    q['correct_answer'] = 'ANULADA'
                else:
                    q['correctAnswer'] = gabarito_letra
                    q['correct_answer'] = gabarito_letra
                    q['isAnulada'] = False
                    q['is_anulada'] = False

                # Metadados de rastreabilidade oficial
                q['questionNumber'] = q_num
                banca_str = pdf_meta.get('banca', '')
                ano_str = pdf_meta.get('ano', '')
                cat_str = pdf_meta.get('categoria', '')
                q['official_source'] = f"PDF MassivoBanco {banca_str} {ano_str} {cat_str} Q{q_num}"
                q['official_audit'] = {
                    'verified': True,
                    'source': 'massivobanco_pdf',
                    'banca': banca_str,
                    'year': ano_str,
                    'category': cat_str,
                    'question_number': q_num,
                    'official_answer': 'ANULADA' if is_anulada else gabarito_letra,
                    'timestamp': datetime.now().isoformat()
                }

                self.dirty_specialties.add(esp)
                self.matches_applied += 1
                self.matches_by_esp[esp] += 1
                matched = True

        if matched:
            # Remove do missing_index para não reprocessar
            del self.missing_index[h]

        return matched

    def flush(self):
        if not self.dirty_specialties:
            return 0
        flushed = 0
        for esp in list(self.dirty_specialties):
            fpath = QUESTION_FILES.get(esp)
            if not fpath or esp not in self.user_questions:
                continue
            tmp_path = f"{fpath}.tmp"
            try:
                with open(tmp_path, 'w', encoding='utf-8') as f:
                    json.dump(self.user_questions[esp], f, ensure_ascii=False, indent=2)
                if os.path.exists(fpath):
                    os.replace(tmp_path, fpath)
                else:
                    os.rename(tmp_path, fpath)
                flushed += 1
            except Exception as e:
                log(f"Erro ao salvar {esp}: {e}")
                if os.path.exists(tmp_path):
                    try: os.remove(tmp_path)
                    except: pass
        self.dirty_specialties.clear()
        return flushed

def extract_pdf_data(fpath):
    """
    Extrai o gabarito oficial e os enunciados das questões do PDF.
    Usa pypdf primeiro (ultrarrápido); se faltar, usa pdfplumber.
    """
    gabarito = {}
    q_statements = {}

    try:
        reader = pypdf.PdfReader(fpath)
        num_pages = len(reader.pages)
        if num_pages == 0:
            return {}, {}

        # 1. Procura gabarito nas últimas páginas (de trás para frente)
        for pno in range(num_pages - 1, max(-1, num_pages - 4), -1):
            txt = reader.pages[pno].extract_text() or ''
            gab = parse_text_grid_gabarito(txt)
            if len(gab) >= 15:
                gabarito = gab
                break

        # Fallback pdfplumber se não achou via pypdf
        if len(gabarito) < 15:
            try:
                with pdfplumber.open(fpath) as pdf:
                    for pno in range(len(pdf.pages) - 1, max(-1, len(pdf.pages) - 4), -1):
                        p = pdf.pages[pno]
                        tables = p.extract_tables()
                        for table in tables:
                            gab = parse_table(table)
                            if len(gab) >= 15:
                                gabarito = gab
                                break
                        if len(gabarito) >= 15:
                            break
            except:
                pass

        if not gabarito:
            return {}, {}

        # 2. Extrai texto das questões de todas as páginas exceto a última
        full_text = ""
        for pno in range(num_pages - 1):
            txt = reader.pages[pno].extract_text() or ''
            full_text += "\n" + txt

        # 3. Faz o split dos enunciados
        q_pattern = re.compile(r'(?:^|\n)\s*(?:QUEST[ÃA]O\s+|Quest[ãa]o\s+)?(\d{1,3})\s*[\)\.\-]\s+([^\n]+)', re.MULTILINE)
        matches = list(q_pattern.finditer(full_text))

        for idx, m in enumerate(matches):
            q_num = int(m.group(1))
            if q_num not in gabarito:
                continue
            start_pos = m.start()
            end_pos = matches[idx+1].start() if idx + 1 < len(matches) else len(full_text)
            q_block = full_text[start_pos:end_pos].strip()

            alt_m = re.search(r'\n\s*[A-Ea-e]\s*[\)\.\-]\s+', q_block)
            if alt_m:
                stmt = q_block[:alt_m.start()].strip()
            else:
                stmt = q_block[:350].strip()

            stmt_clean = re.sub(r'^(?:QUEST[ÃA]O\s+|Quest[ãa]o\s+)?\d{1,3}\s*[\)\.\-]\s*', '', stmt).strip()
            if len(stmt_clean) >= 20:
                q_statements[q_num] = stmt_clean

    except Exception as e:
        pass

    return gabarito, q_statements

def parse_text_grid_gabarito(text):
    gabarito = {}
    if not text:
        return gabarito
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    i = 0
    while i < len(lines):
        line = lines[i]
        nums = [int(x) for x in re.findall(r'\b\d+\b', line)]
        if len(nums) >= 2 and all(1 <= n <= 250 for n in nums):
            if i + 1 < len(lines):
                next_line = lines[i+1]
                ans = [x.upper() for x in re.findall(r'\b[A-Ea-eXN\*#]\b', next_line)]
                if len(nums) == len(ans):
                    for n, a in zip(nums, ans):
                        if 1 <= n <= 250:
                            gabarito[n] = a
                    i += 2
                    continue
        matches = re.findall(r'\b(\d{1,3})\s*[-–.)\s]\s*([A-Ea-eXN\*#])\b', line)
        for n, a in matches:
            n = int(n)
            if 1 <= n <= 250 and n not in gabarito:
                gabarito[n] = a.upper()
        i += 1
    return gabarito

def parse_table(table):
    gab = {}
    if not table:
        return gab
    for r in range(len(table) - 1):
        row_n = table[r]
        row_a = table[r+1]
        if not row_n or not row_a:
            continue
        clean_n = [int(x.strip()) for x in row_n if x and x.strip().isdigit()]
        clean_a = [x.strip().upper() for x in row_a if x and re.match(r'^[A-Ea-eXN\*#]$', x.strip())]
        if len(clean_n) >= 2 and len(clean_n) == len(clean_a):
            for n, a in zip(clean_n, clean_a):
                if 1 <= n <= 250:
                    gab[n] = a
    return gab

def run_massivobanco_pipeline():
    log("="*75)
    log("🚀 INICIANDO MEGA-OPERAÇÃO: EXTRAÇÃO DE GABARITOS DO MASSIVOBANCO")
    log("="*75)

    matcher = MassivoBankMatcher()

    # Catalogar todos os PDFs
    all_pdfs = []
    for year in sorted(os.listdir(MASSIVO_DIR)):
        yp = os.path.join(MASSIVO_DIR, year)
        if not os.path.isdir(yp): continue
        for cat in sorted(os.listdir(yp)):
            cp = os.path.join(yp, cat)
            if not os.path.isdir(cp): continue
            for f in sorted(os.listdir(cp)):
                if f.lower().endswith('.pdf'):
                    # Deriva nome limpo da banca
                    banca_name = f.replace('_+ Gabarito.pdf', '').replace('_Objetiva + Gabarito.pdf', '').replace('.pdf', '').strip()
                    all_pdfs.append({
                        'path': os.path.join(cp, f),
                        'year': year,
                        'categoria': cat,
                        'banca': banca_name,
                        'filename': f
                    })

    total_pdfs = len(all_pdfs)
    log(f"📦 Total de PDFs catalogados em massivobanco: {total_pdfs:,}")

    processed_count = 0
    gabaritos_extraidos_total = 0
    matches_total = 0
    pdfs_com_gabarito = 0

    start_time = time.time()

    for idx, item in enumerate(all_pdfs):
        processed_count += 1
        fpath = item['path']
        banca = item['banca']
        year = item['year']
        cat = item['categoria']

        try:
            gab, stmts = extract_pdf_data(fpath)
            if gab:
                pdfs_com_gabarito += 1
                gabaritos_extraidos_total += len(gab)
                pdf_matches = 0

                # Cruza com enunciados
                for q_num, ans in gab.items():
                    is_anulada = ans in ['X', 'ANULADA', '*', '#']
                    stmt = stmts.get(q_num, '')
                    if stmt:
                        if matcher.apply_match(stmt, ans, is_anulada, item, q_num):
                            pdf_matches += 1
                            matches_total += 1

                if pdf_matches > 0:
                    log(f"   [{idx+1}/{total_pdfs}] {year} | {cat[:10]} | {banca[:25]}: {len(gab)} gabaritos -> 🎯 +{pdf_matches} MATCHES NO BANCO! (Total: {matches_total:,})")

            # Salva no disco a cada 15 PDFs
            if processed_count % 15 == 0:
                matcher.flush()
                # Salva status json
                elapsed = time.time() - start_time
                status_data = {
                    'total_pdfs': total_pdfs,
                    'processed_pdfs': processed_count,
                    'percent': round(processed_count / total_pdfs * 100, 2),
                    'pdfs_com_gabarito': pdfs_com_gabarito,
                    'gabaritos_extraidos_total': gabaritos_extraidos_total,
                    'matches_total': matches_total,
                    'matches_by_esp': matcher.matches_by_esp,
                    'elapsed_seconds': round(elapsed, 1),
                    'last_update': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
                with open(STATUS_FILE, 'w', encoding='utf-8') as sf:
                    json.dump(status_data, sf, ensure_ascii=False, indent=2)

        except Exception as e:
            log(f"⚠️ Erro ao processar {item['filename']}: {e}")

    # Gravação final
    matcher.flush()
    elapsed = time.time() - start_time
    log("="*75)
    log(f"🎉 MEGA-OPERAÇÃO CONCLUÍDA EM {round(elapsed/60, 1)} MINUTOS!")
    log(f"   • PDFs Processados: {processed_count:,} de {total_pdfs:,}")
    log(f"   • PDFs com Gabarito Extraído: {pdfs_com_gabarito:,}")
    log(f"   • Total de Gabaritos Extraídos: {gabaritos_extraidos_total:,}")
    log(f"   • 🎯 TOTAL DE GABARITOS APLICADOS NO BANCO: {matches_total:,}")
    for esp, cnt in matcher.matches_by_esp.items():
        log(f"     - {esp.capitalize():20}: +{cnt:,} gabaritos aplicados")
    log("="*75)

if __name__ == '__main__':
    run_massivobanco_pipeline()
