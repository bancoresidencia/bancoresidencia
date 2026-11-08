import os
import sys
import json
import sqlite3
import glob
import time
import re
import unicodedata
from collections import defaultdict
from rapidfuzz import fuzz

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_DIR = os.path.join(BASE_DIR, 'data')
STAGING_DB = os.path.join(DATA_DIR, 'staging_expansion_unified.db')
REPORT_PATH = os.path.join(BASE_DIR, 'docs', 'RELATORIO_UNIFICACAO_DEDUPLICACAO_STAGING.md')

# ==========================================
# 1. FUNÇÕES DE NORMALIZAÇÃO E TRAVAS MÉDICAS
# ==========================================
def norm_text(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFKD', str(text))
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = re.sub(r'<[^>]*>', ' ', text)
    text = re.sub(r'&nbsp;|&amp;|&lt;|&gt;', ' ', text)
    text = re.sub(r'^(?:questao|item|pergunta)?\s*\d{1,3}\s*[\)\.\-\:]\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'[^a-zA-Z0-9]', ' ', text).lower()
    return re.sub(r'\s+', ' ', text).strip()

def extract_numbers(norm_stmt):
    if not norm_stmt:
        return []
    nums = re.findall(r'\b\d+(?:[.,]\d+)?\b', norm_stmt)
    cleaned = []
    for n in nums:
        val = n.replace(',', '.')
        try:
            fval = float(val)
            cleaned.append(str(int(fval)) if fval.is_integer() else str(fval))
        except:
            cleaned.append(val)
    return sorted(list(set(cleaned)))

NEGATION_TERMS = {
    'nao', 'sem', 'nunca', 'jamais', 'contraindicado', 'contraindicada',
    'incorreto', 'incorreta', 'exceto', 'falso', 'falsa', 'ausente',
    'nenhum', 'nenhuma', 'dispensavel', 'desnecessario', 'desnecessaria'
}

def extract_negations(norm_stmt):
    if not norm_stmt:
        return []
    words = norm_stmt.split()
    return sorted(list(set(w for w in words if w in NEGATION_TERMS)))

def check_medical_guards(nums_a, nums_b, negs_a, negs_b):
    if nums_a and nums_b:
        set_a = set(nums_a)
        set_b = set(nums_b)
        if len(set_a) >= 2 and len(set_b) >= 2 and not (set_a & set_b):
            return False
    strong_negations = {'incorreto', 'incorreta', 'exceto', 'falso', 'falsa', 'contraindicado'}
    has_strong_a = any(n in strong_negations for n in negs_a)
    has_strong_b = any(n in strong_negations for n in negs_b)
    if has_strong_a != has_strong_b:
        return False
    return True

# ==========================================
# 2. INICIALIZAÇÃO DO BANCO DE STAGING
# ==========================================
def init_staging_db(db_path=STAGING_DB):
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
            print(f"🗑️ Banco anterior {db_path} removido para reinício limpo.")
        except:
            pass

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("PRAGMA journal_mode = WAL;")
    cur.execute("PRAGMA synchronous = NORMAL;")
    cur.execute("PRAGMA cache_size = -64000;") # 64MB cache

    cur.execute("""
    CREATE TABLE IF NOT EXISTS raw_extracted_pool (
        id_temp INTEGER PRIMARY KEY AUTOINCREMENT,
        source_base TEXT NOT NULL,
        source_priority INTEGER NOT NULL,
        original_id TEXT,
        enunciado_raw TEXT,
        enunciado_norm TEXT,
        hash_prefix TEXT,
        opcoes_json TEXT,
        gabarito TEXT,
        is_anulada INTEGER DEFAULT 0,
        ano INTEGER,
        instituicao_raw TEXT,
        instituicao_clean TEXT,
        banca_raw TEXT,
        banca_clean TEXT,
        uf TEXT,
        modalidade TEXT,
        especialidade TEXT,
        tema TEXT,
        foco TEXT,
        subfoco TEXT,
        dificuldade TEXT,
        dificuldade_indice REAL,
        comentarios TEXT,
        numbers_json TEXT,
        negations_json TEXT,
        correct_option_text TEXT,
        cluster_id INTEGER
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS unified_staging_questions (
        id_staging INTEGER PRIMARY KEY AUTOINCREMENT,
        anchor_source TEXT NOT NULL,
        anchor_original_id TEXT,
        cluster_id INTEGER,
        cluster_size INTEGER DEFAULT 1,
        enunciado TEXT,
        opcoes_json TEXT,
        gabarito TEXT,
        is_anulada INTEGER DEFAULT 0,
        ano INTEGER,
        instituicao TEXT,
        banca TEXT,
        uf TEXT,
        modalidade TEXT,
        especialidade TEXT,
        tema TEXT,
        foco TEXT,
        subfoco TEXT,
        dificuldade TEXT,
        dificuldade_indice REAL,
        comentarios TEXT,
        sources_merged TEXT,
        filters_enriched_log TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()
    print("✅ Banco de staging inicializado com sucesso.")

# ==========================================
# 3. CARREGADORES DAS 6 FONTES ESTRUTURADAS
# ==========================================
def ingest_all_sources(db_path=STAGING_DB):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("PRAGMA synchronous = OFF;")

    insert_sql = """
    INSERT INTO raw_extracted_pool (
        source_base, source_priority, original_id, enunciado_raw, enunciado_norm,
        hash_prefix, opcoes_json, gabarito, is_anulada, ano,
        instituicao_raw, instituicao_clean, banca_raw, banca_clean, uf,
        modalidade, especialidade, tema, foco, subfoco,
        dificuldade, dificuldade_indice, comentarios,
        numbers_json, negations_json, correct_option_text
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """

    BATCH_SIZE = 5000
    batch = []
    total_inserted = 0

    def flush_batch():
        nonlocal batch, total_inserted
        if batch:
            cur.executemany(insert_sql, batch)
            conn.commit()
            total_inserted += len(batch)
            batch = []

    # ----------------------------------------------------
    # 1. QUESTOESDERESIDENCIA (Prioridade 1)
    # ----------------------------------------------------
    print("\n[1/6] Ingerindo QUESTOESDERESIDENCIA (Prioridade 1)...")
    catalog_path = os.path.join(DATA_DIR, 'scraped_exams', 'metadata', 'exams_catalog.json')
    exam_catalog = {}
    if os.path.exists(catalog_path):
        with open(catalog_path, 'r', encoding='utf-8') as f:
            for item in json.load(f):
                exam_catalog[item['_id']] = item

    qdr_files = glob.glob(os.path.join(DATA_DIR, 'scraped_exams', 'raw', '*', '*.json'))
    qdr_count = 0
    t0 = time.time()

    for fpath in qdr_files:
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                d = json.load(f)
            qs = d.get('questions', [])
            for q in qs:
                qid = q.get('_id')
                raw_text = q.get('text', '')
                norm_stmt = norm_text(raw_text)
                if len(norm_stmt) < 15:
                    continue
                hash_pfx = norm_stmt[:60]
                
                # exam meta
                exam_id = q.get('examId', {}).get('_id') if isinstance(q.get('examId'), dict) else q.get('examId')
                ex_meta = exam_catalog.get(exam_id, {})
                ano = q.get('examYear') or ex_meta.get('year')
                try: ano = int(ano)
                except: ano = None

                inst_raw = None
                inst_clean = None
                if isinstance(ex_meta.get('institution'), dict):
                    inst_clean = ex_meta['institution'].get('name') or ex_meta['institution'].get('abbreviation')
                    inst_raw = ex_meta['institution'].get('name')
                uf = ex_meta.get('state')
                mod = ex_meta.get('category', {}).get('name') if isinstance(ex_meta.get('category'), dict) else None

                # gabarito
                ans_idx = q.get('answerIndex')
                letters = ['A', 'B', 'C', 'D', 'E']
                gabarito = letters[ans_idx] if ans_idx is not None and 0 <= ans_idx < len(letters) else None

                # options
                alts = q.get('alternatives', [])
                correct_opt_text = None
                if gabarito and alts:
                    for idx_a, alt in enumerate(alts):
                        if idx_a == ans_idx:
                            correct_opt_text = norm_text(alt.get('text', ''))

                # taxonomy
                esp = q.get('specialtiesList', [{}])[0].get('label') if q.get('specialtiesList') else None
                subesp = q.get('subspecialtiesList', [{}])[0].get('label') if q.get('subspecialtiesList') else None
                tema = subesp
                foco = q.get('theme', [{}])[0].get('label') if q.get('theme') else None

                # diff & comments
                diff_label = q.get('difficulty_label')
                diff_idx = q.get('difficulty_index')
                comm = None
                if q.get('comments'):
                    comm = json.dumps(q['comments'], ensure_ascii=False)

                nums = extract_numbers(norm_stmt)
                negs = extract_negations(norm_stmt)

                batch.append((
                    'questoesderesidencia', 1, qid, raw_text, norm_stmt,
                    hash_pfx, json.dumps(alts, ensure_ascii=False), gabarito, 0, ano,
                    inst_raw, inst_clean, None, None, uf,
                    mod, esp, tema, foco, None,
                    diff_label, diff_idx, comm,
                    json.dumps(nums), json.dumps(negs), correct_opt_text
                ))
                qdr_count += 1
                if len(batch) >= BATCH_SIZE:
                    flush_batch()
        except:
            pass

    flush_batch()
    print(f"✔ QuestoesDeResidencia: {qdr_count:,} questões inseridas ({time.time()-t0:.1f}s)")

    # ----------------------------------------------------
    # 2. HARDWORK (Prioridade 2)
    # ----------------------------------------------------
    print("\n[2/6] Ingerindo HARDWORK (Prioridade 2)...")
    hw_files = glob.glob(os.path.join(DATA_DIR, 'hardwork', 'provas', '*.json'))
    hw_count = 0
    t0 = time.time()

    for fpath in hw_files:
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                d = json.load(f)
            pm = d.get('provaMeta', {})
            qs = d.get('questoes', [])
            for q in qs:
                qid = q.get('id') or q.get('code')
                raw_text = q.get('statement', '')
                norm_stmt = norm_text(raw_text)
                if len(norm_stmt) < 15:
                    continue
                hash_pfx = norm_stmt[:60]

                ano = q.get('year') or pm.get('ano')
                try: ano = int(ano)
                except: ano = None

                inst_raw = q.get('institution') or pm.get('instituicao')
                banca_raw = q.get('banca') or pm.get('banca')
                uf = pm.get('estado')
                mod = q.get('modalidade') or pm.get('grupo')

                gabarito = q.get('correctAnswer')
                is_anulada = 1 if q.get('isAnulada') else 0

                opts = q.get('options', [])
                correct_opt_text = None
                if gabarito and opts:
                    for opt in opts:
                        if opt.get('letter') == gabarito:
                            correct_opt_text = norm_text(opt.get('text', ''))
                            break

                esp = q.get('especialidade') if q.get('especialidade') != 'Geral' else None
                tema = q.get('tema') if q.get('tema') != 'Geral' else None
                foco = q.get('foco') if q.get('foco') != 'Geral' else None
                subfoco = q.get('subfoco') if q.get('subfoco') != 'Geral' else None
                diff = q.get('difficulty')
                comm = q.get('commentary')

                nums = extract_numbers(norm_stmt)
                negs = extract_negations(norm_stmt)

                batch.append((
                    'hardwork', 2, str(qid), raw_text, norm_stmt,
                    hash_pfx, json.dumps(opts, ensure_ascii=False), gabarito, is_anulada, ano,
                    inst_raw, inst_raw, banca_raw, banca_raw, uf,
                    mod, esp, tema, foco, subfoco,
                    diff, None, comm,
                    json.dumps(nums), json.dumps(negs), correct_opt_text
                ))
                hw_count += 1
                if len(batch) >= BATCH_SIZE:
                    flush_batch()
        except:
            pass

    flush_batch()
    print(f"✔ Hardwork: {hw_count:,} questões inseridas ({time.time()-t0:.1f}s)")

    # ----------------------------------------------------
    # 3. PROVADERESIDENCIA (Prioridade 3)
    # ----------------------------------------------------
    print("\n[3/6] Ingerindo PROVADERESIDENCIA (Prioridade 3)...")
    pr_db = os.path.join(DATA_DIR, 'provaderesidencia_coleta.db')
    pr_count = 0
    t0 = time.time()

    if os.path.exists(pr_db):
        pr_conn = sqlite3.connect(pr_db)
        pr_cur = pr_conn.cursor()
        pr_cur.execute("""
            SELECT q.id, q.enunciado, q.opcoes_json, q.gabarito_oficial, q.is_anulada,
                   p.ano, p.instituicao_raw, p.instituicao_banco, p.uf, p.modalidade
            FROM questoes q
            JOIN provas p ON q.prova_id = p.id;
        """)
        for row in pr_cur.fetchall():
            qid, raw_text, opts_json, gab, is_anul, ano, inst_raw, inst_banco, uf, mod = row
            norm_stmt = norm_text(raw_text)
            if len(norm_stmt) < 15:
                continue
            hash_pfx = norm_stmt[:60]
            try: ano = int(ano)
            except: ano = None

            # find correct option text
            correct_opt_text = None
            if gab and opts_json:
                try:
                    opts = json.loads(opts_json)
                    for opt in opts:
                        if opt.get('letter') == gab:
                            correct_opt_text = norm_text(opt.get('text', ''))
                            break
                except:
                    pass

            nums = extract_numbers(norm_stmt)
            negs = extract_negations(norm_stmt)

            batch.append((
                'provaderesidencia', 3, str(qid), raw_text, norm_stmt,
                hash_pfx, opts_json, gab, is_anul or 0, ano,
                inst_raw, inst_banco or inst_raw, None, None, uf,
                mod, None, None, None, None,
                None, None, None,
                json.dumps(nums), json.dumps(negs), correct_opt_text
            ))
            pr_count += 1
            if len(batch) >= BATCH_SIZE:
                flush_batch()
        pr_conn.close()

    flush_batch()
    print(f"✔ ProvaDeResidencia: {pr_count:,} questões inseridas ({time.time()-t0:.1f}s)")

    # ----------------------------------------------------
    # 4. MEDBRAVE (Prioridade 4)
    # ----------------------------------------------------
    print("\n[4/6] Ingerindo MEDBRAVE (Prioridade 4)...")
    mb_file = os.path.join(DATA_DIR, 'medbrave_questions_clean.json')
    mb_count = 0
    t0 = time.time()

    if os.path.exists(mb_file):
        with open(mb_file, 'r', encoding='utf-8') as f:
            mb_data = json.load(f)
        for q in mb_data:
            qid = q.get('id')
            raw_text = q.get('statement', '')
            norm_stmt = norm_text(raw_text)
            if len(norm_stmt) < 15:
                continue
            hash_pfx = norm_stmt[:60]

            ano = q.get('year')
            try: ano = int(ano)
            except: ano = None

            inst = q.get('institution')
            banca = q.get('banca')
            uf = q.get('uf')
            gab = q.get('correct_letter')
            is_anul = 1 if q.get('is_annulled') else 0

            alts = q.get('alternatives', [])
            correct_opt_text = None
            if gab and alts:
                for alt in alts:
                    if alt.get('letter') == gab:
                        correct_opt_text = norm_text(alt.get('text', ''))
                        break

            esp = q.get('specialty')
            tema = q.get('theme')
            foco = q.get('focus')
            diff = q.get('difficulty')

            nums = extract_numbers(norm_stmt)
            negs = extract_negations(norm_stmt)

            batch.append((
                'medbrave', 4, str(qid), raw_text, norm_stmt,
                hash_pfx, json.dumps(alts, ensure_ascii=False), gab, is_anul, ano,
                inst, inst, banca, banca, uf,
                'R1 - Acesso Direto', esp, tema, foco, None,
                diff, None, None,
                json.dumps(nums), json.dumps(negs), correct_opt_text
            ))
            mb_count += 1
            if len(batch) >= BATCH_SIZE:
                flush_batch()

    flush_batch()
    print(f"✔ MedBrave: {mb_count:,} questões inseridas ({time.time()-t0:.1f}s)")

    # ----------------------------------------------------
    # 5. AJUDAMEDICO (Prioridade 5)
    # ----------------------------------------------------
    print("\n[5/6] Ingerindo AJUDAMEDICO (Prioridade 5)...")
    aj_file = os.path.join(DATA_DIR, 'knowledge', 'ajudamedico_consolidado_9223.json')
    aj_count = 0
    t0 = time.time()

    if os.path.exists(aj_file):
        with open(aj_file, 'r', encoding='utf-8') as f:
            aj_data = json.load(f).get('questoes', [])
        for q in aj_data:
            qid = q.get('id') or q.get('originalId')
            raw_text = q.get('statement', '')
            norm_stmt = norm_text(raw_text)
            if len(norm_stmt) < 15:
                continue
            hash_pfx = norm_stmt[:60]

            ano = q.get('year')
            try: ano = int(ano)
            except: ano = None

            exam_inst = q.get('exam')
            banca = q.get('banca')
            uf = q.get('uf')
            gab = q.get('officialAnswer')
            is_anul = 1 if gab in ['ANULADA', 'X', '*'] else 0

            opts = q.get('options', [])
            correct_opt_text = None
            if gab and opts:
                for opt in opts:
                    if opt.get('letter') == gab:
                        correct_opt_text = norm_text(opt.get('text', ''))
                        break

            tags = q.get('tags', [])
            tema_tags = ", ".join(tags) if tags else None
            diff = q.get('difficulty')
            comm = q.get('medicalExplanation')

            nums = extract_numbers(norm_stmt)
            negs = extract_negations(norm_stmt)

            batch.append((
                'ajudamedico', 5, str(qid), raw_text, norm_stmt,
                hash_pfx, json.dumps(opts, ensure_ascii=False), gab, is_anul, ano,
                exam_inst, exam_inst, banca, banca, uf,
                'R1 - Acesso Direto', None, tema_tags, None, None,
                diff, None, comm,
                json.dumps(nums), json.dumps(negs), correct_opt_text
            ))
            aj_count += 1
            if len(batch) >= BATCH_SIZE:
                flush_batch()

    flush_batch()
    print(f"✔ AjudaMedico: {aj_count:,} questões inseridas ({time.time()-t0:.1f}s)")

    # ----------------------------------------------------
    # 6. DRIVEPROJETORAPIDO (Prioridade 7)
    # ----------------------------------------------------
    print("\n[6/6] Ingerindo DRIVEPROJETORAPIDO (Prioridade 7)...")
    dp_count = 0
    t0 = time.time()

    if os.path.exists(pr_db):
        dp_conn = sqlite3.connect(pr_db)
        dp_cur = dp_conn.cursor()
        dp_cur.execute("""
            SELECT id, pdf_path, pdf_name, uf, numero, enunciado, gabarito
            FROM drive_novas_questoes;
        """)
        for row in dp_cur.fetchall():
            qid, pdf_path, pdf_name, uf, num, raw_text, gab = row
            norm_stmt = norm_text(raw_text)
            if len(norm_stmt) < 15:
                continue
            hash_pfx = norm_stmt[:60]

            # extract year from pdf_name
            ano_m = re.search(r'\b(20\d{2}|19\d{2})\b', str(pdf_name))
            ano = int(ano_m.group(1)) if ano_m else None

            # extract institution from pdf_path folder
            inst = None
            if pdf_path:
                parts = pdf_path.replace('\\', '/').split('/')
                if len(parts) >= 2:
                    inst = parts[-2]

            nums = extract_numbers(norm_stmt)
            negs = extract_negations(norm_stmt)

            batch.append((
                'driveprojetorapido', 7, f"DP_{qid}", raw_text, norm_stmt,
                hash_pfx, "[]", gab, 0, ano,
                inst, inst, None, None, uf,
                'R1 - Acesso Direto', None, None, None, None,
                None, None, None,
                json.dumps(nums), json.dumps(negs), None
            ))
            dp_count += 1
            if len(batch) >= BATCH_SIZE:
                flush_batch()
        dp_conn.close()

    flush_batch()
    print(f"✔ DriveProjetoRapido: {dp_count:,} questões inseridas ({time.time()-t0:.1f}s)")

    # Indexes
    print("\nCriando índices de alta performance no staging pool...")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_raw_hash_pfx ON raw_extracted_pool(hash_prefix);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_raw_source_prio ON raw_extracted_pool(source_priority);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_raw_ano_gab ON raw_extracted_pool(ano, gabarito);")
    conn.commit()
    conn.close()

    print(f"\n🎉 INGESTÃO TOTAL CONCLUÍDA: {total_inserted:,} questões no staging pool!")
    return total_inserted

# ==========================================
# 4. MOTOR DE CLUSTERIZAÇÃO E DEDUPLICAÇÃO
# ==========================================
class DisjointSetUnion:
    def __init__(self):
        self.parent = {}

    def find(self, i):
        if i not in self.parent:
            self.parent[i] = i
            return i
        if self.parent[i] == i:
            return i
        self.parent[i] = self.find(self.parent[i])
        return self.parent[i]

    def union(self, i, j):
        root_i = self.find(i)
        root_j = self.find(j)
        if root_i != root_j:
            self.parent[root_i] = root_j

def run_deduplication(db_path=STAGING_DB):
    print("\n" + "="*60)
    print("INICIANDO MOTOR DE DEDUPLICAÇÃO (85% + GABARITO + TRAVAS)")
    print("="*60)

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("PRAGMA cache_size = -64000;")

    # Load candidate records
    t0 = time.time()
    print("Carregando pool de questões para memória...")
    cur.execute("""
        SELECT id_temp, source_priority, hash_prefix, ano, gabarito,
               enunciado_norm, numbers_json, negations_json, correct_option_text
        FROM raw_extracted_pool
        ORDER BY id_temp ASC;
    """)
    rows = cur.fetchall()
    print(f"Carregadas {len(rows):,} questões em {time.time()-t0:.2f}s")

    dsu = DisjointSetUnion()

    # Block 1: Group by hash_prefix (first 60 chars of normalized text)
    print("Executando Bloco 1: Correspondência por Prefixo Hash (O(1))...")
    prefix_buckets = defaultdict(list)
    for r in rows:
        qid, prio, pfx, ano, gab, norm_stmt, nums_j, negs_j, opt_txt = r
        if pfx and len(pfx) >= 20:
            prefix_buckets[pfx].append(r)

    matches_found = 0
    t1 = time.time()
    
    # Process prefix buckets
    for pfx, bucket in prefix_buckets.items():
        if len(bucket) <= 1:
            continue
        # Compare pairs in bucket
        for i in range(len(bucket)):
            rA = bucket[i]
            idA, prioA, _, anoA, gabA, normA, numsA_j, negsA_j, optA = rA
            numsA = json.loads(numsA_j or '[]')
            negsA = json.loads(negsA_j or '[]')

            for j in range(i + 1, len(bucket)):
                rB = bucket[j]
                idB, prioB, _, anoB, gabB, normB, numsB_j, negsB_j, optB = rB
                
                # Check gabarito match: direct letter or matching correct alternative text
                gab_match = False
                if gabA and gabB:
                    if gabA == gabB:
                        gab_match = True
                    elif optA and optB:
                        if fuzz.ratio(optA, optB) >= 85:
                            gab_match = True
                elif not gabA or not gabB:
                    # One missing gabarito, allow text match to enrich it!
                    gab_match = True

                if not gab_match:
                    continue

                # Medical guards
                numsB = json.loads(numsB_j or '[]')
                negsB = json.loads(negsB_j or '[]')
                if not check_medical_guards(numsA, numsB, negsA, negsB):
                    continue

                # Statement similarity >= 85%
                sim = fuzz.ratio(normA, normB)
                if sim < 85:
                    sim = fuzz.token_set_ratio(normA, normB)

                if sim >= 85:
                    dsu.union(idA, idB)
                    matches_found += 1

    print(f"✔ Bloco 1 finalizado: {matches_found:,} pares conectados ({time.time()-t1:.2f}s)")

    # Assign cluster_ids
    print("Atribuindo Cluster IDs a todas as questões...")
    t2 = time.time()
    cluster_updates = []
    cluster_members = defaultdict(list)

    for r in rows:
        qid = r[0]
        cid = dsu.find(qid)
        cluster_updates.append((cid, qid))
        cluster_members[cid].append(qid)

    cur.executemany("UPDATE raw_extracted_pool SET cluster_id = ? WHERE id_temp = ?;", cluster_updates)
    conn.commit()

    total_clusters = len(cluster_members)
    multi_clusters = sum(1 for m in cluster_members.values() if len(m) > 1)
    duplicates_eliminated = len(rows) - total_clusters
    print(f"✔ Total de clusters únicos: {total_clusters:,}")
    print(f"✔ Clusters com 2 ou mais questões idênticas: {multi_clusters:,}")
    print(f"✔ Duplicatas que serão eliminadas: {duplicates_eliminated:,} ({time.time()-t2:.2f}s)")

    conn.close()
    return total_clusters, duplicates_eliminated

# ==========================================
# 5. FUSÃO INTELIGENTE (BEST-OF-ALL-BASES)
# ==========================================
def is_valid_institution(inst):
    if not inst: return False
    inst = str(inst).strip().lower()
    if inst.endswith('.pdf') or 'drive' in inst or inst in ['outros', 'exam', 'geral', 'sem instituicao', 'none']:
        return False
    return len(inst) >= 3

def is_valid_taxonomy(tax):
    if not tax: return False
    tax = str(tax).strip().lower()
    if tax in ['geral', 'outros', 'outras', 'assunto geral', 'none']:
        return False
    return len(tax) >= 3

def consolidate_golden_records(db_path=STAGING_DB):
    print("\n" + "="*60)
    print("INICIANDO FUSÃO E CONSOLIDAÇÃO DO GOLDEN RECORD")
    print("="*60)

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("PRAGMA cache_size = -64000;")

    # Clear target table
    cur.execute("DELETE FROM unified_staging_questions;")
    conn.commit()

    t0 = time.time()
    # Group questions by cluster_id
    cur.execute("""
        SELECT cluster_id, id_temp, source_base, source_priority, original_id,
               enunciado_raw, opcoes_json, gabarito, is_anulada, ano,
               instituicao_raw, instituicao_clean, banca_raw, banca_clean, uf,
               modalidade, especialidade, tema, foco, subfoco,
               dificuldade, dificuldade_indice, comentarios
        FROM raw_extracted_pool
        ORDER BY cluster_id, source_priority ASC;
    """)

    clusters = defaultdict(list)
    for row in cur.fetchall():
        cid = row[0]
        clusters[cid].append(row[1:])

    print(f"Processando fusão de {len(clusters):,} clusters em memória...")

    insert_unified_sql = """
    INSERT INTO unified_staging_questions (
        anchor_source, anchor_original_id, cluster_id, cluster_size,
        enunciado, opcoes_json, gabarito, is_anulada, ano,
        instituicao, banca, uf, modalidade,
        especialidade, tema, foco, subfoco,
        dificuldade, dificuldade_indice, comentarios,
        sources_merged, filters_enriched_log
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """

    BATCH_SIZE = 5000
    batch = []
    total_golden = 0
    total_enriched_attributes = 0

    for cid, members in clusters.items():
        # Members are already sorted by source_priority ASC
        # The first member is our Anchor Record
        anchor = members[0]
        (
            aid, asource, aprio, a_orig_id,
            a_stmt, a_opts, a_gab, a_is_anul, a_ano,
            a_inst_raw, a_inst_clean, a_banca_raw, a_banca_clean, a_uf,
            a_mod, a_esp, a_tema, a_foco, a_subfoco,
            a_diff, a_diff_idx, a_comm
        ) = anchor

        sources_set = [asource]
        enriched_log = {}

        # Values to be enriched
        final_inst = a_inst_clean or a_inst_raw
        final_banca = a_banca_clean or a_banca_raw
        final_ano = a_ano
        final_uf = a_uf
        final_mod = a_mod
        final_esp = a_esp
        final_tema = a_tema
        final_foco = a_foco
        final_subfoco = a_subfoco
        final_diff = a_diff
        final_diff_idx = a_diff_idx
        final_gab = a_gab
        final_is_anul = a_is_anul
        final_comm = a_comm

        # Iterate secondary members in cluster to coalesce significant filters
        for sec in members[1:]:
            (
                s_id, s_source, s_prio, s_orig_id,
                s_stmt, s_opts, s_gab, s_is_anul, s_ano,
                s_inst_raw, s_inst_clean, s_banca_raw, s_banca_clean, s_uf,
                s_mod, s_esp, s_tema, s_foco, s_subfoco,
                s_diff, s_diff_idx, s_comm
            ) = sec

            if s_source not in sources_set:
                sources_set.append(s_source)

            # 1. Instituição
            if not is_valid_institution(final_inst) and is_valid_institution(s_inst_clean or s_inst_raw):
                final_inst = s_inst_clean or s_inst_raw
                enriched_log['instituicao'] = f"{s_source}:{final_inst}"
                total_enriched_attributes += 1

            # 2. Banca
            if not final_banca and (s_banca_clean or s_banca_raw):
                final_banca = s_banca_clean or s_banca_raw
                enriched_log['banca'] = f"{s_source}:{final_banca}"
                total_enriched_attributes += 1

            # 3. Ano
            if (not final_ano or final_ano == 0) and (s_ano and s_ano > 1900):
                final_ano = s_ano
                enriched_log['ano'] = f"{s_source}:{final_ano}"
                total_enriched_attributes += 1

            # 4. UF
            if not final_uf and s_uf:
                final_uf = s_uf
                enriched_log['uf'] = f"{s_source}:{final_uf}"
                total_enriched_attributes += 1

            # 5. Modalidade
            if (not final_mod or final_mod == 'OUTRAS PROVAS') and (s_mod and s_mod != 'OUTRAS PROVAS'):
                final_mod = s_mod
                enriched_log['modalidade'] = f"{s_source}:{final_mod}"
                total_enriched_attributes += 1

            # 6. Taxonomia (Especialidade, Tema, Foco, Subfoco)
            if not is_valid_taxonomy(final_esp) and is_valid_taxonomy(s_esp):
                final_esp = s_esp
                enriched_log['especialidade'] = f"{s_source}:{final_esp}"
                total_enriched_attributes += 1

            if not is_valid_taxonomy(final_tema) and is_valid_taxonomy(s_tema):
                final_tema = s_tema
                enriched_log['tema'] = f"{s_source}:{final_tema}"
                total_enriched_attributes += 1

            if not is_valid_taxonomy(final_foco) and is_valid_taxonomy(s_foco):
                final_foco = s_foco
                enriched_log['foco'] = f"{s_source}:{final_foco}"
                total_enriched_attributes += 1

            if not is_valid_taxonomy(final_subfoco) and is_valid_taxonomy(s_subfoco):
                final_subfoco = s_subfoco
                enriched_log['subfoco'] = f"{s_source}:{final_subfoco}"
                total_enriched_attributes += 1

            # 7. Dificuldade & TRI
            if not final_diff and s_diff:
                final_diff = s_diff
                enriched_log['dificuldade'] = f"{s_source}:{final_diff}"
                total_enriched_attributes += 1
            if final_diff_idx is None and s_diff_idx is not None:
                final_diff_idx = s_diff_idx
                enriched_log['dificuldade_indice'] = f"{s_source}:{final_diff_idx}"
                total_enriched_attributes += 1

            # 8. Gabarito & Anulação
            if not final_gab and s_gab:
                final_gab = s_gab
                final_is_anul = s_is_anul
                enriched_log['gabarito'] = f"{s_source}:{final_gab}"
                total_enriched_attributes += 1
            elif s_is_anul and not final_is_anul:
                final_is_anul = 1
                final_gab = 'ANULADA'
                enriched_log['anulada'] = f"{s_source}:ANULADA"
                total_enriched_attributes += 1

            # 9. Comentários
            if not final_comm and s_comm:
                final_comm = s_comm
                enriched_log['comentarios'] = f"{s_source}:present"
                total_enriched_attributes += 1

        batch.append((
            asource, a_orig_id, cid, len(members),
            a_stmt, a_opts, final_gab, final_is_anul, final_ano,
            final_inst, final_banca, final_uf, final_mod,
            final_esp, final_tema, final_foco, final_subfoco,
            final_diff, final_diff_idx, final_comm,
            json.dumps(sources_set), json.dumps(enriched_log)
        ))
        total_golden += 1

        if len(batch) >= BATCH_SIZE:
            cur.executemany(insert_unified_sql, batch)
            conn.commit()
            batch = []

    if batch:
        cur.executemany(insert_unified_sql, batch)
        conn.commit()

    conn.close()
    print(f"🎉 FUSÃO CONCLUÍDA:")
    print(f"   • Total de Golden Records gerados: {total_golden:,}")
    print(f"   • Total de atributos enriquecidos seletivamente: {total_enriched_attributes:,}")
    print(f"   • Tempo: {time.time()-t0:.2f}s")
    return total_golden, total_enriched_attributes

# ==========================================
# 6. RELATÓRIO DE AUDITORIA E LINHAGEM
# ==========================================
def generate_audit_report(db_path=STAGING_DB, out_md=REPORT_PATH):
    print("\nGerando Relatório de Auditoria e Linhagem em markdown...")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM raw_extracted_pool;")
    total_raw = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM unified_staging_questions;")
    total_unified = cur.fetchone()[0]

    cur.execute("SELECT anchor_source, COUNT(*) FROM unified_staging_questions GROUP BY anchor_source ORDER BY COUNT(*) DESC;")
    by_anchor = cur.fetchall()

    cur.execute("SELECT cluster_size, COUNT(*) FROM unified_staging_questions GROUP BY cluster_size ORDER BY cluster_size ASC;")
    by_cluster_size = cur.fetchall()

    cur.execute("SELECT COUNT(*) FROM unified_staging_questions WHERE instituicao IS NOT NULL AND instituicao != '';")
    with_inst = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM unified_staging_questions WHERE banca IS NOT NULL AND banca != '';")
    with_banca = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM unified_staging_questions WHERE ano IS NOT NULL AND ano > 0;")
    with_ano = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM unified_staging_questions WHERE gabarito IS NOT NULL AND gabarito != '';")
    with_gab = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM unified_staging_questions WHERE especialidade IS NOT NULL AND especialidade != '';")
    with_esp = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM unified_staging_questions WHERE tema IS NOT NULL AND tema != '';")
    with_tema = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM unified_staging_questions WHERE foco IS NOT NULL AND foco != '';")
    with_foco = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM unified_staging_questions WHERE dificuldade IS NOT NULL AND dificuldade != '';")
    with_diff = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM unified_staging_questions WHERE comentarios IS NOT NULL AND comentarios != '';")
    with_comm = cur.fetchone()[0]

    cur.execute("""
        SELECT anchor_source, instituicao, ano, gabarito, especialidade, tema, foco, cluster_size, sources_merged, filters_enriched_log
        FROM unified_staging_questions
        WHERE cluster_size > 1
        LIMIT 5;
    """)
    samples_merged = cur.fetchall()

    conn.close()

    md = f"""# Relatório de Auditoria: Unificação e Deduplicação Staging (7 Bases)

**Data de Conclusão:** {time.strftime('%Y-%m-%d %H:%M:%S')}  
**Banco de Staging Gerado:** `{os.path.basename(db_path)}`  
**Escopo:** Processamento 100% isolado de staging. **Zero alterações no banco ativo e zero chamadas ao Supabase.**

---

## 1. Balanço Quantitativo Global

| Métrica | Valor Absoluto | Percentual |
| :--- | :--- | :--- |
| **Total de Questões Brutas Ingeridas** | **{total_raw:,}** | 100,00% |
| **Questões Duplicadas Eliminadas** | **{total_raw - total_unified:,}** | **{((total_raw - total_unified)/total_raw*100):.2f}%** |
| **Golden Records Únicos Gerados** | **{total_unified:,}** | **{(total_unified/total_raw*100):.2f}%** |

---

## 2. Distribuição da Questão Âncora (Por Base Prioritária)

A questão âncora define o enunciado mestre e as alternativas da questão unificada:

| Base de Origem Âncora | Prioridade | Volume de Golden Records | Participação |
| :--- | :---: | :--- | :--- |
"""
    for src, cnt in by_anchor:
        md += f"| `{src}` | {src} | **{cnt:,}** | {(cnt/total_unified*100):.1f}% |\n"

    md += """
---

## 3. Distribuição do Tamanho dos Clusters (Grau de Duplicação)

| Tamanho do Cluster | Quantidade de Questões | Descrição |
| :--- | :--- | :--- |
"""
    for csize, cnt in by_cluster_size:
        desc = "Questão única (presente em apenas 1 base)" if csize == 1 else f"Questão idêntica em {csize} bases diferentes"
        md += f"| {csize}x | **{cnt:,}** | {desc} |\n"

    md += f"""
---

## 4. Cobertura dos Filtros no Golden Record Unificado

Graças ao motor de **fusão do filtro mais significativo** (*Best-of-All-Bases*), metadados ausentes na base primária foram preenchidos a partir das bases secundárias do mesmo cluster:

| Filtro / Metadado | Questões Preenchidas | Cobertura Final |
| :--- | :--- | :--- |
| **Instituição** | **{with_inst:,}** | **{(with_inst/total_unified*100):.1f}%** |
| **Banca** | **{with_banca:,}** | **{(with_banca/total_unified*100):.1f}%** |
| **Ano** | **{with_ano:,}** | **{(with_ano/total_unified*100):.1f}%** |
| **Gabarito Homologado** | **{with_gab:,}** | **{(with_gab/total_unified*100):.1f}%** |
| **Especialidade** | **{with_esp:,}** | **{(with_esp/total_unified*100):.1f}%** |
| **Tema** | **{with_tema:,}** | **{(with_tema/total_unified*100):.1f}%** |
| **Foco Clínico** | **{with_foco:,}** | **{(with_foco/total_unified*100):.1f}%** |
| **Dificuldade (TRI / Rótulo)** | **{with_diff:,}** | **{(with_diff/total_unified*100):.1f}%** |
| **Comentários / Justificativas** | **{with_comm:,}** | **{(with_comm/total_unified*100):.1f}%** |

---

## 5. Amostras de Enriquecimento e Fusão Realizada

Abaixo constam 5 exemplos reais de questões consolidadas a partir de múltiplas bases:

"""
    for i, s in enumerate(samples_merged, 1):
        md += f"""### Amostra {i}
* **Base Âncora:** `{s[0]}` | **Cluster Size:** {s[7]}
* **Instituição:** {s[1]} | **Ano:** {s[2]} | **Gabarito:** {s[3]}
* **Especialidade:** {s[4]} | **Tema:** {s[5]} | **Foco:** {s[6]}
* **Bases Fundidas:** `{s[8]}`
* **Log de Filtros Enriquecidos:** `{s[9]}`

"""

    os.makedirs(os.path.dirname(out_md), exist_ok=True)
    with open(out_md, 'w', encoding='utf-8') as f:
        f.write(md)

    print(f"✔ Relatório de Auditoria salvo em: {out_md}")

# ==========================================
# 7. EXECUÇÃO PRINCIPAL DO PIPELINE
# ==========================================
if __name__ == '__main__':
    t_start = time.time()
    print("="*70)
    print("🚀 PIPELINE DE UNIFICAÇÃO E DEDUPLICAÇÃO DAS 7 BASES (STAGING LOCAL)")
    print("="*70)
    
    init_staging_db(STAGING_DB)
    ingest_all_sources(STAGING_DB)
    run_deduplication(STAGING_DB)
    consolidate_golden_records(STAGING_DB)
    generate_audit_report(STAGING_DB, REPORT_PATH)
    
    total_elapsed = time.time() - t_start
    print("\n" + "="*70)
    print(f"🏁 PIPELINE COMPLETO EXECUTADO COM SUCESSO EM {total_elapsed/60:.2f} MINUTOS!")
    print("="*70)
